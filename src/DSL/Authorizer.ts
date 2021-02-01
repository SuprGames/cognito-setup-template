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