import { ValidationException } from '../exception/validation.exception'
import { EmailValidator } from './email.validator'
import { UserParamsValidator } from './user.params.validator'


export class ResetPasswordValidator {
    public static validate(email: string, new_password: string): void | ValidationException {
        const fields: Array<string> = []
        if (!email) fields.push('email')
        else EmailValidator.validate(email)
        if (!new_password) fields.push('new_password')
        else UserParamsValidator.validatePassword(new_password)
        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Reset password validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
