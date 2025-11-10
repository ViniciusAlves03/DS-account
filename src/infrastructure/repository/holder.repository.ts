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

    public async checkExists(users: Holder | Array<Holder>): Promise<boolean | ValidationException> {
        try {
            if (users instanceof Array) {
                if (users.length === 0) return false;

                const checkPromises = users.map(holder => {
                    const query = new Query();
                    if (holder.id) {
                        query.addFilter({ _id: holder.id });
                    }
                    query.addFilter({ type: UserType.HOLDER });
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
                query.addFilter({ type: UserType.HOLDER });
                query.addFilter({ email: users.email });

                const result = await this.findOne(query);
                return !!result;
            }
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public findOneById(holderId: string): Promise<Holder | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id: holderId, type: UserType.HOLDER } }))
    }

    public async associateDependent(holderId: string, dependentId: string): Promise<boolean | undefined> {
        try {
            const result: HolderEntity | null = await this._holderModel.findOneAndUpdate(
                { _id: holderId, type: UserType.HOLDER },
                { $addToSet: { dependents: dependentId } }
            ).exec();

            if (!result) return undefined;

            return true;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async checkDependentIsAssociated(holderId: string, dependentId: string): Promise<boolean> {
        const query: IQuery = new Query().fromJSON({
            filters: { _id: holderId, type: UserType.HOLDER, dependents: dependentId }
        });

        try {
            const result = await super.findOne(query);
            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async updateAuthorizationDependent(dependentId: string, isAuthorized: boolean): Promise<boolean> {
        try {
            const updatedDependent = await this._dependentRepository.updateAuthorization(dependentId, isAuthorized);
            return !!updatedDependent;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async removeAssociationDependentById(holderId: string, dependentId: string): Promise<Holder | undefined> {
        try {
            const result: HolderEntity | null = await this._holderModel.findOneAndUpdate(
                { _id: holderId, type: UserType.HOLDER },
                { $pull: { dependents: dependentId } }
            ).exec();

            if (!result) return undefined;
            return this._holderMapper.transform(result);
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async removeDependentById(dependentId: string): Promise<boolean | undefined> {
        try {
            const result: HolderEntity | null = await this._holderModel.findOneAndUpdate(
                { type: UserType.HOLDER, dependents: dependentId },
                { $pull: { dependents: dependentId } }
            ).exec();

            return !!result;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }
}

