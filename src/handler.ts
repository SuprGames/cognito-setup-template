import { Authorizer, AuthorizerType } from '../dsl-processor'
import { HttpFunction, HttpMethod } from '../dsl-processor'

//§DSL
new HttpFunction({
    name: 'hello-world',
    method: HttpMethod.GET,
    path: '/hello',
    cors: true,
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
