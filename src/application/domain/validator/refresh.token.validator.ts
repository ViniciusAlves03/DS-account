import { ValidationException } from '../exception/validation.exception'
import { Auth } from '../model/auth'


export class RefreshTokenValidator {
    public static validate(auth: Auth): void | ValidationException {
        const fields: Array<string> = []

        if (!auth.access_token) fields.push('access_token')
        if (!auth.refresh_token || !auth.refresh_token.hash) fields.push('refresh_token')

        if (fields.length > 0) {
            throw new ValidationException('Required fields were not provided...',
                'Refresh Token validation: '.concat(fields.join(', ')).concat(' is required!'))
        }
    }
}
