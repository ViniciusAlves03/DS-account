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

    public async checkExists(users: Dependent | Array<Dependent>): Promise<boolean | ValidationException> {
        try {
            if (users instanceof Array) {
                if (users.length === 0) return false;

                const checkPromises = users.map(dependent => {
                    const query = new Query();
                    if (dependent.id) {
                        query.addFilter({ _id: dependent.id });
                    }
                    query.addFilter({ type: UserType.DEPENDENT });

                    return this.findOne(query);
                });

                const results = await Promise.all(checkPromises);

                const notFoundIds: string[] = [];
                results.forEach((result, index) => {
                    if (!result && users[index].id) {
                        notFoundIds.push(users[index].id!);
                    }
                });

                if (notFoundIds.length > 0) {
                    return new ValidationException(notFoundIds.join(', '));
                }
                return true;

            } else {
                const query: Query = new Query();
                if (users.id) query.addFilter({ _id: users.id });
                query.addFilter({ type: UserType.DEPENDENT });
                query.addFilter({ email: users.email });

                const result = await this.findOne(query);
                return !!result;
            }
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public findOneById(dependentId: string): Promise<Dependent | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id: dependentId, type: UserType.DEPENDENT } }))
    }

    public async updateAuthorization(dependentId: string, isAuthorized: boolean): Promise<Dependent | undefined> {
        try {
            const result = await this._dependentModel.findOneAndUpdate(
                { _id: dependentId, type: UserType.DEPENDENT },
                { $set: { isAuthorized: isAuthorized } },
                { new: true }
            ).exec();

            if (!result) {
                return undefined;
            }
            return this._dependentMapper.transform(result);
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }
}
