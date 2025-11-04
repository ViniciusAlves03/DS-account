import { inject, injectable } from "inversify";
import { BaseRepository } from "./base/base.repository";
import { Dependent } from "../../application/domain/model/dependent";
import { DependentEntity } from "../../infrastructure/entity/dependent.entity";
import { Identifier } from "../../di/identifiers";
import { IEntityMapper } from "../../infrastructure/port/entity.mapper.interface";
import { IDependentRepository } from "../../application/port/dependent.repository.interface";
import { ILogger } from "../../utils/custom.logger";
import { IUserRepository } from "../../application/port/user.repository.interface";
import { Query } from "./query/query";
import { ValidationException } from "../../application/domain/exception/validation.exception";
import { UserType } from "../../application/domain/utils/user.type";


@injectable()
export class DependentRepository extends BaseRepository<Dependent, DependentEntity> implements IDependentRepository {
    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly _dependentModel: any,
        @inject(Identifier.DEPENDENT_ENTITY_MAPPER) readonly _dependentMapper:
            IEntityMapper<Dependent, DependentEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly _logger: ILogger
    ) {
        super(_dependentModel, _dependentMapper, _logger)
    }

    public create(item: Dependent): Promise<Dependent | undefined> {
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        return super.create(item)
    }

    public checkExists(users: Dependent | Array<Dependent>): Promise<boolean | ValidationException> {
        const query: Query = new Query()
        return new Promise<boolean | ValidationException>((resolve, reject) => {
            if (users instanceof Array) {
                if (users.length === 0) return resolve(false)

                let count = 0
                const resultHolders: Array<string> = []

                users.forEach((dependent: Dependent) => {
                    if (dependent.id) query.filters = { _id: dependent.id }

                    query.addFilter({ type: UserType.DEPENDENT })

                    this.findOne(query)
                        .then(result => {
                            count++
                            if (!result && dependent.id) resultHolders.push(dependent.id)
                            if (count === users.length) {
                                if (resultHolders.length > 0) return resolve(new ValidationException(resultHolders.join(', ')))
                                return resolve(true)
                            }
                        }).catch(err => reject(super.mongoDBErrorListener(err)))
                })
            } else {
                if (users.id) query.addFilter({ _id: users.id })
                query.addFilter({ type: UserType.DEPENDENT })
                query.addFilter({ email: users.email });
                this.findOne(query)
                    .then(result => resolve(!!result))
                    .catch(err => reject(super.mongoDBErrorListener(err)))
            }
        })
    }

    public findOneById(dependentId: string): Promise<Dependent | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id: dependentId, type: UserType.DEPENDENT } }))
    }

    public updateAuthorization(dependentId: string, isAuthorized: boolean): Promise<Dependent | undefined> {
        return new Promise<Dependent | undefined>((resolve, reject) => {
            this._dependentModel.findOneAndUpdate(
                { _id: dependentId, type: UserType.DEPENDENT },
                { $set: { isAuthorized: isAuthorized } },
                { new: true }
            )
                .exec()
                .then(result => {
                    if (!result) {
                        return resolve(undefined)
                    }
                    return resolve(this._dependentMapper.transform(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }
}
