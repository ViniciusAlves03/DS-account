import { inject, injectable } from 'inversify'
import { User } from '../../application/domain/model/user'
import { Identifier } from '../../di/identifiers'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { UserEntity } from '../entity/user.entity'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { BaseRepository } from './base/base.repository'
import { ILogger } from '../../utils/custom.logger'
import { Query } from './query/query'
import { UserType } from '../../application/domain/utils/user.type'
import { ChangePasswordException } from '../../application/domain/exception/change.password.exception'
import { Strings } from '../../utils/strings'
import bcrypt from 'bcryptjs'


@injectable()
export class UserRepository extends BaseRepository<User, UserEntity> implements IUserRepository {
    constructor(
        @inject(Identifier.USER_REPO_MODEL) protected readonly _userModel: any,
        @inject(Identifier.USER_ENTITY_MAPPER) protected readonly _userMapper: IEntityMapper<User, UserEntity>,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_userModel, _userMapper, _logger)
    }

    public findOneById(_id: string): Promise<User | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id } }))
    }

    public checkExistsByIdAndType(_id: string, type: string): Promise<boolean> {
        const query: Query = new Query().fromJSON({ filters: { _id, type } })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: User | undefined) => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public async checkExists(user: User): Promise<boolean> {
        const query: Query = new Query().fromJSON({ filters: { _id: { $ne: user.id }, email: user.email } })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then((result: User | undefined) => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public changePassword(userEmail: string, oldPassword: string, newPassword: string): Promise<User | undefined> {
        return new Promise<User | undefined>((resolve, reject) => {
            this._userModel.findOne({ email: userEmail })
                .then((user: { password: string; change_password: boolean; }) => {
                    if (!user) return resolve(undefined)
                    if (!this.comparePasswords(oldPassword, user.password)) {
                        return reject(new ChangePasswordException(
                            Strings.USER.PASSWORD_NOT_MATCH,
                            Strings.USER.PASSWORD_NOT_MATCH_DESCRIPTION
                        ))
                    }
                    user.password = this.encryptPassword(newPassword)
                    user.change_password = false
                    this._userModel.findOneAndUpdate({ email: userEmail }, user, { new: true })
                        .then(result => resolve(this._userMapper.transform(result)))
                        .catch(err => reject(super.mongoDBErrorListener(err)))
                }).catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public encryptPassword(password: string): string {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    public comparePasswords(passwordOne: string, passwordTwo: string): boolean {
        return bcrypt.compareSync(passwordOne, passwordTwo)
    }

    public updateLastLogin(login: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userModel
                .findOneAndUpdate({ email: login }, { last_login: new Date().toISOString() })
                .then(result => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public updateLastLoginById(id: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._userModel
                .findOneAndUpdate({ _id: id }, { last_login: new Date().toISOString() })
                .then(result => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public countAdmins(): Promise<number> {
        const query: Query = new Query().fromJSON({ filters: { type: UserType.ADMIN } })
        return super.count(query)
    }

    public countHolders(): Promise<number> {
        const query: Query = new Query().fromJSON({ filters: { type: UserType.HOLDER } })
        return super.count(query)
    }

    public countDependents(): Promise<number> {
        const query: Query = new Query().fromJSON({ filters: { type: UserType.DEPENDENT } })
        return super.count(query)
    }
}
