import { Exception } from './exception'


export class ConflictException extends Exception {
    constructor(message: string, description?: string) {
        super(message, description)
    }
}
