import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { AdminEntity } from '../entity/admin.entity'
import { Admin } from '../../application/domain/model/admin'
import { Identifier } from '../../di/identifiers'
import { IAdminRepository } from '../../application/port/admin.repository.interface'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IUserRepository } from '../../application/port/user.repository.interface'
import { IQuery } from '../../application/port/query.interface'


@injectable()
export class AdminRepository extends BaseRepository<Admin, AdminEntity> implements IAdminRepository {
    constructor(
        @inject(Identifier.USER_REPO_MODEL) readonly _adminModel: any,
        @inject(Identifier.ADMIN_ENTITY_MAPPER) readonly _adminEntityMapper: IEntityMapper<Admin, AdminEntity>,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.LOGGER) readonly _logger: any
    ) {
        super(_adminModel, _adminEntityMapper, _logger)
    }

    public create(item: Admin): Promise<Admin | undefined> {
        if (item.password) item.password = this._userRepository.encryptPassword(item.password)
        return super.create(item)
    }

    public async find(query: IQuery): Promise<Array<Admin>> {
        try {
            const result: Array<Admin> = await super.find(query);

            const enrichedResults = await Promise.all(
                result.map(admin => this.addReadOnlyInformation(admin))
            );

            return enrichedResults;
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async findOne(query: IQuery): Promise<Admin | undefined> {
        try {
            const result: Admin | undefined = await super.findOne(query);

            if (!result) return undefined;

            return await this.addReadOnlyInformation(result);
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public async update(item: Admin): Promise<Admin | undefined> {
        try {
            const result: Admin | undefined = await super.update(item);

            if (!result) return undefined;

            return await this.addReadOnlyInformation(result);
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    private async addReadOnlyInformation(item: Admin): Promise<Admin> {
        if (item) {
            const [totalAdmins, totalHolders, totalDependents] = await Promise.all([
                this._userRepository.countAdmins(),
                this._userRepository.countHolders(),
                this._userRepository.countDependents()
            ]);

            item.total_admins = totalAdmins;
            item.total_holders = totalHolders;
            item.total_dependents = totalDependents;
        }

        return item;
    }
}
