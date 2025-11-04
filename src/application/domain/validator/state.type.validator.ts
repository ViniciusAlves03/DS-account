import { Strings } from '../../../utils/strings'
import { ValidationException } from '../exception/validation.exception'
import { StateType } from '../utils/state.type'


export class StateTypeValidator {
    public static validate(level: string): void | ValidationException {
        const stateTypes: Array<string> = Object.values(StateType)

        if (!stateTypes.includes(level)) {
            throw new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_FIELDS,
                Strings.ERROR_MESSAGE.VALIDATE.STATE_TYPES_DESC.replace('{0}', stateTypes.join(', ')))
        }
    }
}
