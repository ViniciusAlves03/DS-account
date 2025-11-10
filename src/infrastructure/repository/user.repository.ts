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

    public async checkExistsByIdAndType(_id: string, type: string): Promise<boolean> {
        const query: Query = new Query().fromJSON({ filters: { _id, type } });
        try {
            const result: User | undefined = await super.findOne(query);
            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async checkExists(user: User): Promise<boolean> {
        const query: Query = new Query().fromJSON({ filters: { _id: { $ne: user.id }, email: user.email } });
        try {
            const result: User | undefined = await super.findOne(query);
            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async changePassword(userEmail: string, oldPassword: string, newPassword: string): Promise<User | undefined> {
        try {
            const user: any = await this._userModel.findOne({ email: userEmail });
            if (!user) return undefined;

            if (!this.comparePasswords(oldPassword, user.password)) {
                throw new ChangePasswordException(
                    Strings.USER.PASSWORD_NOT_MATCH,
                    Strings.USER.PASSWORD_NOT_MATCH_DESCRIPTION
                );
            }

            user.password = this.encryptPassword(newPassword);
            user.change_password = false;

            const result = await this._userModel.findOneAndUpdate({ email: userEmail }, user, { new: true });

            return this._userMapper.transform(result);
        } catch (err: unknown) {
            if (err instanceof ChangePasswordException) throw err;
            throw super.mongoDBErrorListener(err);
        }
    }

    public encryptPassword(password: string): string {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    public comparePasswords(passwordOne: string, passwordTwo: string): boolean {
        return bcrypt.compareSync(passwordOne, passwordTwo)
    }

    public async updateLastLogin(login: string): Promise<boolean> {
        try {
            const result = await this._userModel
                .findOneAndUpdate({ email: login }, { last_login: new Date().toISOString() });
            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async updateLastLoginById(id: string): Promise<boolean> {
        try {
            const result = await this._userModel
                .findOneAndUpdate({ _id: id }, { last_login: new Date().toISOString() });
            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
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
