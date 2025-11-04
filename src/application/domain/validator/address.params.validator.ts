import { ValidationException } from '../exception/validation.exception'
import { TextFieldsValidator } from './text.fields.validator'


export class AddressParamsValidator {
    public static validateStreet(street: string): void | ValidationException {
        TextFieldsValidator.validateTextField(street, 2, 60, 'Street')
    }

    public static validateNumber(number: string): void | ValidationException {
        TextFieldsValidator.validateTextField(number, 1, 10, 'Number')
        if (!(/^[A-Za-z0-9 /]{1,10}$/.test(number))) {
            throw new ValidationException('Number must contains only letters, numbers and /.')
        }
    }

    public static validateComplement(complement: string): void | ValidationException {
        TextFieldsValidator.validateTextField(complement, 2, 60, 'Complement')
    }

    public static validateDistrict(district: string): void | ValidationException {
        TextFieldsValidator.validateTextField(district, 2, 60, 'District')
    }

    public static validateCity(city: string): void | ValidationException {
        TextFieldsValidator.validateTextField(city, 2, 60, 'City')
    }

    public static validateZipCode(zipCode: string): void | ValidationException {
        if (!(/^[\d]{8}$/.test(zipCode))) {
            throw new ValidationException('Zip Code must contains only 8 numbers.')
        }
    }
}
