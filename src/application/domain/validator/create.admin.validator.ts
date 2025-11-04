import { Admin } from '../model/admin'
import { ValidationException } from '../exception/validation.exception'
import { EmailValidator } from './email.validator'
import { CreateUserValidator } from './create.user.validator'
import { UserParamsValidator } from './user.params.validator'


export class CreateAdminValidator {
    public static validate(item: Admin): void | ValidationException {
        const fields: Array<string> = []

        CreateUserValidator.validate(item, 'Admin')

        if (!item.email) fields.push('email')
        else EmailValidator.validate(item.email)
        if (!item.password) fields.push('password')
        else UserParamsValidator.validatePassword(item.password)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Admin validation: '.concat(fields.join(', ')).concat(' required!'))
        }
    }
}
