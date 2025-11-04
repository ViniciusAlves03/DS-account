import { User } from '../model/user'
import { ValidationException } from '../exception/validation.exception'
import { DateValidator } from './date.validator'
import { GenderTypesValidator } from './gender.types.validator'
import { LanguageValidator } from './language.validator'
import { UserParamsValidator } from './user.params.validator'

export class CreateUserValidator {
    public static validate(item: User, type?: string) {
        const fields: Array<string> = []

        if (!item.name) fields.push('name')
        else UserParamsValidator.validateName(item.name)
        if (!item.birth_date) fields.push('birth_date')
        else DateValidator.validate(item.birth_date)
        if (!item.gender) fields.push('gender')
        else GenderTypesValidator.validate(item.gender)

        if (item.language) LanguageValidator.validate(item.language)

        if (fields.length) {
            throw new ValidationException('Required fields were not provided...',
                `${type ? type : 'User'} validation: ${fields.join(', ')} required.`)
        }
    }
}
