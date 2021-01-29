class LambdaFunction {
    print: (file: string, name: string) => string
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
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

const fs = require('fs')
const readline = require('readline')

const dir = 'src'

const STARTING_TOKEN = '//§DSL'
const ENDING_TOKEN = '//!§DSL'

const processFile = (filePath) => {
    var dslProcessInProgress = false
    var completedBlock = false
    var processBuffer = ''

    const processLine = (filename) => (line) => {
        const tline = line.trim()
        if (tline.startsWith(STARTING_TOKEN)) {
            if (dslProcessInProgress) {
                throw Error('Invalid STARTING_TOKEN found, starting DSL section with another')
            }
            dslProcessInProgress = true
        } else if (tline.startsWith(ENDING_TOKEN)) {
            dslProcessInProgress = false
            completedBlock = true
        } else if (tline.startsWith('//')) {
            //We ignore this line, it is a comment
        } else if (dslProcessInProgress) {
            console.log(tline)
            processBuffer += tline
        }
        if (completedBlock) {
            console.log((eval(processBuffer) as LambdaFunction).print(filename, 'nameHere'))
            processBuffer = ''
            completedBlock = false
        }
    }

    readline
        .createInterface({
            input: fs.createReadStream(filePath),
        })
        .on('line', processLine(filePath))
}

const processDir = (err, filenames) => {
    if (err) {
        console.log("Error reading folder 'src', make sure it exists")
    }
    console.log(`Processing ${dir}`)
    filenames.forEach((filename) => {
        console.log(`\tProcessing ${dir}/${filename}`)
        processFile(`${dir}/${filename}`)
    })
}

console.log('******************************')
console.log('   SERVERLESS DSL Generator')
console.log('******************************')

fs.readdir(dir, processDir)
