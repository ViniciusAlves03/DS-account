import { User } from '../domain/model/user'
import { Credentials } from '../domain/model/credentials'
import { IRepository } from './repository.interface'
import { Auth } from '../domain/model/auth'


export interface IAuthRepository extends IRepository<Auth>{
    authenticate(credentials: Credentials): Promise<Auth | undefined>

    refreshToken(auth: Auth): Promise<Auth | undefined>

    resetPassword(_email: string): Promise<User>

    updatePassword(userId: string, userEmail: string, new_password: string, token: string): Promise<User>

    validateToken(token: string): Promise<boolean>

    getTokenPayload(token: string): Promise<any>
}
