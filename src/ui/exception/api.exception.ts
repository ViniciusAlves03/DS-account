import { Exception } from '../../application/domain/exception/exception'


export class ApiException extends Exception {
    public code: number
    public description?: string
    public redirect_link?: string

    constructor(code: number, message: string, description?: string, redirect_link?: string) {
        super(message)
        this.code = code
        this.description = description
        this.redirect_link = redirect_link
    }

    public toJSON(): object {
        return {
            code: this.code,
            message: this.message,
            description: this.description,
            redirect_link: this.redirect_link
        }
    }
}
