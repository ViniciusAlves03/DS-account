import { Exception } from './exception'


export class RepositoryException extends Exception {
    constructor(message: string, description?: string) {
        super(message, description)
    }
}
