import { HttpMethod, HttpFunction, Authorizer, AuthorizerType } from '../process'

//§DSL
new HttpFunction({
    method: HttpMethod.GET,
    path: '/hello',
    authorizer: new Authorizer({
        name: 'basic-auth-game-provider',
        resultTtlInSeconds: 0,
        identitySource: 'method.request.header.Authorization',
        type: AuthorizerType.REQUEST,
    }),
})
//!§DSL
export const handle = async (_event, _context) => {
    console.log('hello world')
    return 'successful invocation'
}
