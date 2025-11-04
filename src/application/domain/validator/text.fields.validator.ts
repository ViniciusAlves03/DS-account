import {ValidationException} from '../exception/validation.exception'
import { Strings } from '../../../utils/strings'


export class TextFieldsValidator {
    public static validateTextField(text: string, min: number, max: number, field: string): void | ValidationException {
        if (typeof text !== 'string') {
            throw new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.INVALID_STRING.replace('{0}', field))
        } else if (text.length < min || text.length > max) {
            throw new ValidationException(
                `${field} must contain a minimum of ${min} and a maximum of ${max} characters.`)
        }
    }
}
