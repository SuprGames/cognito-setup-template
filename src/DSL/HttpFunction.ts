import { LambdaFunction } from './LambdaFunction'
import { Authorizer } from './Authorizer'

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
