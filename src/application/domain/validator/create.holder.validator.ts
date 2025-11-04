import { ValidationException } from '../exception/validation.exception'
import { Holder } from '../model/holder'
import { CreateAddressValidator } from './create.address.validator'
import { CreateUserValidator } from './create.user.validator'
import { EmailValidator } from './email.validator'
import { UserParamsValidator } from './user.params.validator'

export class CreateHolderValidator {
    public static validate(item: Holder): void | ValidationException {
        const fields: Array<string> = []

        CreateUserValidator.validate(item, 'Holder')

        if (!item.email) fields.push('email')
        else EmailValidator.validate(item.email)
        if (!item.password) fields.push('password')
        else UserParamsValidator.validatePassword(item.password)

        if (item.address) CreateAddressValidator.validate(item.address)

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Holder validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
