import { Credentials } from '../domain/model/credentials'
import { Auth } from '../domain/model/auth'


export interface IAuthService {
    authenticate(credentials: Credentials): Promise<Auth | undefined>

    refreshToken(auth: Auth): Promise<Auth | undefined>

    forgotPassword(email: string): Promise<object>

    changePassword(email: string, old_password: string, new_password: string, token: string): Promise<boolean>
}
