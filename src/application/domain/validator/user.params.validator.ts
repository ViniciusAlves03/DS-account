import { ValidationException } from '../exception/validation.exception'
import { TextFieldsValidator } from './text.fields.validator'


export class UserParamsValidator {
    public static validateName(name: string): void | ValidationException {
        TextFieldsValidator.validateTextField(name, 2, 90, 'Name')
    }

    public static validatePassword(password: string): void | ValidationException {
        TextFieldsValidator.validateTextField(password, 4, 30, 'Password')
    }
}
