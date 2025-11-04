import { ValidationException } from '../exception/validation.exception'
import { GenderTypes } from '../utils/gender.types'
import { Strings } from '../../../utils/strings'


export class GenderTypesValidator {
    public static validate(value: string): void | ValidationException {
        const genderTypes: Array<string> = Object.values(GenderTypes)

        if (!genderTypes.includes(value)) {
            throw new ValidationException(
                Strings.ENUM_VALIDATOR.NOT_MAPPED.replace('{0}', `gender: ${value}`),
                Strings.ENUM_VALIDATOR.NOT_MAPPED_DESC.replace('{0}', genderTypes.join(', ').concat('.')))
        }
    }
}
