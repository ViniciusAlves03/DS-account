import { Exception } from './exception'


export class ChangePasswordException extends Exception {
    public link?: string

    constructor(message: string, description?: string, link?: string) {
        super(message, description)
        this.link = link
    }
}
