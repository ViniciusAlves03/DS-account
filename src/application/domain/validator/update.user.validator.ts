import { ValidationException } from '../exception/validation.exception'
import { User } from '../model/user'
import { ObjectIdValidator } from './object.id.validator'
import { DateValidator } from './date.validator'
import { LanguageValidator } from './language.validator'
import { UserParamsValidator } from './user.params.validator'
import { GenderTypesValidator } from './gender.types.validator'


export class UpdateUserValidator {
    public static validate(item: User): void | ValidationException {
        if (item.id) ObjectIdValidator.validate(item.id)
        if (item.name) UserParamsValidator.validateName(item.name)
        if (item.birth_date) DateValidator.validate(item.birth_date)
        if (item.gender) GenderTypesValidator.validate(item.gender)
        if (item.language) LanguageValidator.validate(item.language)
    }
}
