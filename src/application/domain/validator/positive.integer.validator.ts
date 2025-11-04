import { Strings } from '../../../utils/strings'
import { ValidationException } from '../exception/validation.exception'
import { NumberValidator } from './number.validator'


export class PositiveIntegerValidator {
    public static validate(value: number, fieldName: string): void | ValidationException {
        NumberValidator.validate(value, fieldName)

        if (!(/^[1-9]+[0-9]*$/i).test(String(value))) {
            throw new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.NEGATIVE_OR_ZERO_INTEGER.replace('{0}', fieldName))
        }
    }
}
