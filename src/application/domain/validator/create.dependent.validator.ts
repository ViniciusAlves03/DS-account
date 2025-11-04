import { ValidationException } from '../exception/validation.exception'
import { Dependent } from '../model/dependent'
import { CreateAddressValidator } from './create.address.validator'
import { CreateUserValidator } from './create.user.validator'
import { EmailValidator } from './email.validator'
import { UserParamsValidator } from './user.params.validator'

export class CreateDependentValidator {
    public static validate(item: Dependent): void | ValidationException {
        const fields: Array<string> = []

        CreateUserValidator.validate(item, 'Dependent')

        if (!item.email) fields.push('email')
        else EmailValidator.validate(item.email)
        if (!item.password) fields.push('password')
        else UserParamsValidator.validatePassword(item.password)

        if (item.address === undefined) fields.push('address')
        else CreateAddressValidator.validate(item.address)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Dependent validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
