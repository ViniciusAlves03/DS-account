import { Strings } from '../../../utils/strings'
import { ValidationException } from '../exception/validation.exception'


export class NumberValidator {
    public static validate(value: number, fieldName: string): void | ValidationException {
        if (typeof value !== 'number') {
            throw new ValidationException(
                Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.INVALID_NUMBER.replace('{0}', fieldName))
        }
    }
}
