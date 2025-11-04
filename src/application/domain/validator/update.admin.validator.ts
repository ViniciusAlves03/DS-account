import { ValidationException } from '../exception/validation.exception'
import { UpdateUserValidator } from './update.user.validator'
import { Admin } from '../model/admin'
import { Strings } from '../../../utils/strings'
import { EmailValidator } from './email.validator'


export class UpdateAdminValidator {
    public static validate(item: Admin): void | ValidationException {
        UpdateUserValidator.validate(item)
        if (item.email) EmailValidator.validate(item.email)
        if (item.password) {
            throw new ValidationException(Strings.ERROR_MESSAGE.PARAMETER_COULD_NOT_BE_UPDATED,
                'A specific route to update user password already exists. ' +
                `Access: PATCH /v1/auth/password to update your password.`)
        }
    }
}
