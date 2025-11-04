import { inject, injectable } from "inversify";
import { BaseRepository } from "./base/base.repository";
import { IHolderRepository } from "../../application/port/holder.repository.interface";
import { IDependentRepository } from "../../application/port/dependent.repository.interface";
import { Holder } from "../../application/domain/model/holder";
import { HolderEntity } from "../../infrastructure/entity/holder.entity";
import { Identifier } from "../../di/identifiers";
import { IEntityMapper } from "../../infrastructure/port/entity.mapper.interface";
import { ILogger } from "../../utils/custom.logger";
import { IUserRepository } from "../../application/port/user.repository.interface";
import { IQuery } from '../../application/port/query.interface'
import { Query } from "./query/query";
import { ValidationException } from "../../application/domain/exception/validation.exception";
import { UserType } from "../../application/domain/utils/user.type";


@injectable()
export class HolderRepository extends BaseRepository<Holder, HolderEntity> implements IHolderRepository {
    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly _holderModel: any,
        @inject(Identifier.HOLDER_ENTITY_MAPPER) readonly _holderMapper:
            IEntityMapper<Holder, HolderEntity>,
        @inject(Identifier.DEPENDENT_REPOSITORY) private readonly _dependentRepository: IDependentRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_holderModel, _holderMapper, _logger)
    }

    public create(item: Holder): Promise<Holder | undefined> {
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        return super.create(item)
    }

    public checkExists(users: Holder | Array<Holder>): Promise<boolean | ValidationException> {
        const query: Query = new Query()
        return new Promise<boolean | ValidationException>((resolve, reject) => {
            if (users instanceof Array) {
                if (users.length === 0) return resolve(false)

                let count = 0
                const resultHolders: Array<string> = []

                users.forEach((holder: Holder) => {
                    if (holder.id) query.filters = { _id: holder.id }

                    query.addFilter({ type: UserType.HOLDER })

                    this.findOne(query)
                        .then(result => {
                            count++
                            if (!result && holder.id) resultHolders.push(holder.id)
                            if (count === users.length) {
                                if (resultHolders.length > 0) return resolve(new ValidationException(resultHolders.join(', ')))
                                return resolve(true)
                            }
                        }).catch(err => reject(super.mongoDBErrorListener(err)))
                })
            } else {
                if (users.id) query.addFilter({ _id: users.id })
                query.addFilter({ type: UserType.HOLDER })
                query.addFilter({ email: users.email });
                this.findOne(query)
                    .then(result => resolve(!!result))
                    .catch(err => reject(super.mongoDBErrorListener(err)))
            }
        })
    }

    public findOneById(holderId: string): Promise<Holder | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id: holderId, type: UserType.HOLDER } }))
    }

    public associateDependent(holderId: string, dependentId: string): Promise<boolean | undefined> {
        return new Promise<boolean | undefined>((resolve, reject) => {
            this._holderModel.findOneAndUpdate(
                { _id: holderId, type: UserType.HOLDER },
                { $addToSet: { dependents: dependentId } })
                .exec()
                .then((result: HolderEntity) => {
                    if (!result) return resolve(undefined)
                    return resolve(this._holderMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public checkDependentIsAssociated(holderId: string, dependentId: string): Promise<boolean> {
        const query: IQuery = new Query().fromJSON({
            filters: { _id: holderId, type: UserType.HOLDER, dependents: dependentId }
        })
        return new Promise<boolean>((resolve, reject) => {
            super.findOne(query)
                .then(result => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public updateAuthorizationDependent(dependentId: string, isAuthorized: boolean): Promise<boolean> {
        return this._dependentRepository.updateAuthorization(dependentId, isAuthorized)
            .then(updatedDependent => {
                return !!updatedDependent;
            })
            .catch(err => {
                throw super.mongoDBErrorListener(err);
            });
    }

    public removeAssociationDependentById(holderId: string, dependentId: string): Promise<Holder | undefined> {
        return new Promise<Holder | undefined>((resolve, reject) => {
            this._holderModel.findOneAndUpdate(
                { _id: holderId, type: UserType.HOLDER },
                { $pull: { dependents: dependentId } })
                .exec()
                .then((result: HolderEntity) => {
                    if (!result) return resolve(undefined)
                    return resolve(this._holderMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public removeDependentById(dependentId: string): Promise<boolean | undefined> {
        return new Promise<boolean>((resolve, reject) => {
            this._holderModel.findOneAndUpdate(
                { type: UserType.HOLDER, dependents: dependentId },
                { $pull: { dependents: dependentId } })
                .exec()
                .then((result: HolderEntity) => resolve(!!result))
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}

