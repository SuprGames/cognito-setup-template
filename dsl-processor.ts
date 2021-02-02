// DSL Definition
export class LambdaFunction {
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

export class HttpFunction extends LambdaFunction {
    path: string
    method: HttpMethod
    authorizer?: Authorizer

    constructor(params: { path: string; method: HttpMethod; authorizer?: Authorizer }) {
        super()
        this.path = params.path
        this.method = params.method
        this.authorizer = params.authorizer
    }

    print = (file: string, name: string): string => {
        return `
  ${name}:
    handler: ${file}
    events:
      - httpApi: 
        method: ${this.method}
        path: ${this.path}`.concat(this.authorizer ? this.authorizer.print() : '')
    }
}

async function processCode(codeFolder: string): Promise<string> {
    console.log(`\tProcessing code ${codeFolder}`)
    console.log('')
    return `
\t\td
\t\t  f
\t\t  f
\t\td
    `
}

function updateServerlessFileFunctionSection(serverlessFile: string, functionContent: string): void {
    console.log(`\tUpdating ${serverlessFile} file with folowing content`)
    console.log()
    console.log(functionContent)
    console.log()
    console.log('\tFile updated')
    console.log()
}

//Processing side
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
