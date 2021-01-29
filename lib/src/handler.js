import { HttpMethod, HttpFunction, Authorizer, AuthorizerType } from '../process';
export class Handler {
    constructor() {
        this.handlerDef = new HttpFunction({
            method: HttpMethod.GET,
            path: '/hello',
            authorizer: new Authorizer({
                name: 'basic-auth-game-provider',
                resultTtlInSeconds: 0,
                identitySource: 'method.request.header.Authorization',
                type: AuthorizerType.REQUEST,
            }),
        });
    }
    async handler(_event, _context) {
        console.log('hello world');
        return 'successful invocation';
    }
}
//# sourceMappingURL=handler.js.map