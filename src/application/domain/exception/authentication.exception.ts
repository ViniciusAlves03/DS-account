import { Exception } from './exception'


export class AuthenticationException extends Exception {
    constructor(message: string, description?: string) {
        super(message, description)
    }
}
