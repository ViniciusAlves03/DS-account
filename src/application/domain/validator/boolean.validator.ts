import { ValidationException } from '../exception/validation.exception'


export class BooleanValidator {
    public static validate(value: any): void | ValidationException {
        if (typeof value !== 'boolean') {
            throw new ValidationException(
                'Invalid Type!',
                'The value provided must be a boolean'
            );
        }
    }
}
