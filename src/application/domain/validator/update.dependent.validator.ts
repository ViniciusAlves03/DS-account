import { Strings } from '../../../utils/strings'
import { ValidationException } from '../exception/validation.exception'
import { Dependent } from '../model/dependent'
import { UpdateAddressValidator } from './update.address.validator'
import { UpdateUserValidator } from './update.user.validator'


export class UpdateDependentValidator {
    public static validate(item: Dependent): void | ValidationException {
        UpdateUserValidator.validate(item)
        if (item.email) {
            throw new ValidationException(Strings.PARAMETERS.COULD_NOT_BE_UPDATED)
        }
        if (item.address) UpdateAddressValidator.validate(item.address)
        if (item.password) {
            throw new ValidationException(Strings.ERROR_MESSAGE.PARAMETER_COULD_NOT_BE_UPDATED,
                'A specific route to update user password already exists. ' +
                `Access: PATCH /v1/auth/password to update your password.`)
        }
    }
}
