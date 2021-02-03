import { lstatSync, readdirSync, readFileSync } from 'fs'

// DSL Definition
export class LambdaFunction {
    name: string
    print: (file: string, name: string) => string
}

export enum AuthorizerType {
    REQUEST = 'request',
}

export class Authorizer {
    name: string
    resultTtlInSeconds: number
    identitySource: string
    type: AuthorizerType

    constructor(params: { name: string; resultTtlInSeconds: number; identitySource: string; type: AuthorizerType }) {
        this.name = params.name
        this.resultTtlInSeconds = params.resultTtlInSeconds
        this.identitySource = params.identitySource
        this.type = params.type
    }

    print = (): string => {
        return `
        authorizer:
          name: ${this.name}
          resultTtlInSeconds: ${this.resultTtlInSeconds}
          identitySource: ${this.identitySource}
          type: ${this.type}
        `
    }
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export class HttpApiFunction extends LambdaFunction {
    name: string
    path: string
    cors: boolean
    method: HttpMethod

    constructor(params: { name: string; path: string; method: HttpMethod; cors: boolean }) {
        super()
        this.name = params.name
        this.path = params.path
        this.method = params.method
        this.cors = params.cors
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - httpApi: 
          method: ${this.method}
          path: ${this.path}
          cors: ${this.cors}`
    }
}

export class HttpFunction extends LambdaFunction {
    name: string
    path: string
    cors: boolean
    method: HttpMethod
    authorizer?: Authorizer

    constructor(params: { name: string; path: string; method: HttpMethod; authorizer?: Authorizer; cors: boolean }) {
        super()
        this.name = params.name
        this.path = params.path
        this.method = params.method
        this.cors = params.cors
        this.authorizer = params.authorizer
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - http: 
          method: ${this.method}
          path: ${this.path}
          cors: ${this.cors}`.concat(this.authorizer ? this.authorizer.print() : '')
    }
}

export enum WebSocketRoutes {
    CONNECT = '$connect',
    DISCONNECT = '$disconnect',
    DEFAULT = '$default',
}

export class WebSocketConector extends LambdaFunction {
    name: string
    route: string

    constructor(params: { name: string; route: string | WebSocketConector }) {
        super()
        this.name = params.name
        this.route = params.route.toString()
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - websocket: 
          route: ${this.route}`
    }
}

export enum CognitoPoolTrigger {
    CreateAuthChallenge = 'CreateAuthChallenge',
    CustomMessage = 'CustomMessage',
    DefineAuthChallenge = 'DefineAuthChallenge',
    PostAuthentication = 'PostAuthentication',
    PostConfirmation = 'PostConfirmation',
    PreAuthentication = 'PreAuthentication',
    PreSignUp = 'PreSignUp',
    PreTokenGeneration = 'PreTokenGeneration',
    UserMigration = 'UserMigration',
    VerifyAuthChallengeResponse = 'VerifyAuthChallengeResponse',
}

export class CognitoUserPoolTriggered extends LambdaFunction {
    name: string
    pool: string
    trigger: CognitoPoolTrigger
    existing: boolean

    constructor(params: { name: string; pool: string; trigger: CognitoPoolTrigger; existing: boolean }) {
        super()
        this.name = params.name
        this.pool = params.pool
        this.trigger = params.trigger
        this.existing = params.existing
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - cognitoUserPool: 
          pool: ${this.pool}
          trigger: ${this.trigger}
          existing: ${this.existing}`
    }
}

export class EventBridgeListener extends LambdaFunction {
    name: string
    eventBusArn: string
    detailType: string

    constructor(params: { name: string; eventBusArn: string; detailType: string }) {
        super()
        this.name = params.name
        this.eventBusArn = params.eventBusArn
        this.detailType = params.detailType
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - eventBridge: 
          eventBus: ${this.eventBusArn}
          pattern:
            detail-type:
              - ${this.detailType}`
    }
}

//Processing Section

//  Processing utilities
const STARTING_TOKEN = '//§DSL'
const ENDING_TOKEN = '//!§DSL'

function processFile(file: string): string {
    var dslProcessInProgress = false
    var processBuffer = ''

    const data = readFileSync(file, 'utf-8').split('\n')
    const lambdas: string[] = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].startsWith(STARTING_TOKEN)) {
            if (dslProcessInProgress) {
                throw Error('Invalid STARTING_TOKEN found, starting DSL section with another')
            }
            dslProcessInProgress = true
        } else if (data[i].startsWith(ENDING_TOKEN)) {
            dslProcessInProgress = false
            const lambda = eval(processBuffer) as LambdaFunction
            const name = data[i + 1].split(' =')[0].split(' ').pop()
            const fileTokens = file.split('.')
            fileTokens.pop()
            const fileName = fileTokens.join('.')
            lambdas.push(lambda.print(`${fileName}.${name}`, lambda.name))
        } else if (dslProcessInProgress) {
            processBuffer += data[i]
        }
    }
    return lambdas.join('\n')
}

function processElement(name: string): string {
    const stat = lstatSync(name)
    let result = ''
    if (stat.isFile()) {
        result = processFile(name)
    } else if (stat.isDirectory()) {
        return readdirSync(name)
            .map((filename) => processElement(`${name}/${filename}`))
            .join('\n')
    }
    return result
}

async function processCode(codeFolder: string): Promise<string> {
    console.log(`\tProcessing code ${codeFolder}`)
    console.log('')
    return readdirSync(codeFolder)
        .map((filename) => processElement(`${codeFolder}/${filename}`))
        .join('\n')
}

function updateServerlessFileFunctionSection(serverlessFile: string, functionContent: string): void {
    console.log(`\tUpdating ${serverlessFile} file with folowing content`)
    console.log()
    console.log(functionContent)
    console.log()
    console.log('\tFile updated')
    console.log()
}

// Main processing function
const codeFolder = 'src'
const serverlessFile = 'serverless.yml'
console.log()
console.log('************************************************************************')
console.log(`Serverless Framework DSL processor §`)
console.log()
console.log(`\tSource code main folder: ${codeFolder}`)
console.log()
console.log()
processCode(codeFolder).then((s) => {
    updateServerlessFileFunctionSection(serverlessFile, s)
    console.log('************************************************************************')
})
