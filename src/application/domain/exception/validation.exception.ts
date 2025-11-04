import { Exception } from './exception'


export class ValidationException extends Exception {
    constructor(message: string, description?: string) {
        super(message, description)
    }
}
