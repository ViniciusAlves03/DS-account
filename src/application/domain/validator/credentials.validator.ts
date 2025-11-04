import { ValidationException } from '../exception/validation.exception'
import { Credentials } from '../model/credentials'

export class CredentialsValidator {
    public static validate(auth: Credentials): void | ValidationException {
        const fields: Array<string> = []

        if (!auth.login) fields.push('login')
        if (!auth.password) fields.push('password')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Authentication validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
