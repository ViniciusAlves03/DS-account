import { IRepository } from './repository.interface'
import { User } from '../domain/model/user'


export interface IUserRepository extends IRepository<User> {
    findOneById(_id: string): Promise<User | undefined>

    checkExistsByIdAndType(_id: string, type: string): Promise<boolean>

    checkExists(user: User): Promise<boolean>

    changePassword(userEmail: string, oldPassword: string, newPassword: string): Promise<User | undefined>

    encryptPassword(password: string): string

    comparePasswords(passwordOne: string, passwordTwo: string): boolean

    updateLastLogin(login: string): Promise<boolean>

    updateLastLoginById(id: string): Promise<boolean>

    countDependents(): Promise<number>

    countHolders(): Promise<number>

    countAdmins(): Promise<number>
}
