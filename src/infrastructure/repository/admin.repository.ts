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

    public find(query: IQuery): Promise<Array<Admin>> {
        return new Promise<Array<Admin>>((resolve, reject) => {
            super.find(query)
                .then(async (result: Array<Admin>) => {
                    for (let i = 0; i < result.length; i++) result[i] = await this.addReadOnlyInformation(result[i])
                    resolve(result)
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public findOne(query: IQuery): Promise<Admin | undefined> {
        return new Promise<Admin | undefined>((resolve, reject) => {
            super.findOne(query)
                .then(async (result: Admin | undefined) => {
                    if (!result) return resolve(undefined)
                    return resolve(await this.addReadOnlyInformation(result))
                })
                .catch(err => reject(super.mongoDBErrorListener(err)))
        })
    }

    public update(item: Admin): Promise<Admin | undefined> {
        return new Promise<Admin | undefined>((resolve, reject) => {
            super.update(item)
                .then(async (result: Admin | undefined) => {
                    if (!result) return resolve(undefined)
                    return resolve(await this.addReadOnlyInformation(result))
                })
                .catch(err => reject(this.mongoDBErrorListener(err)))
        })
    }

    private async addReadOnlyInformation(item: Admin): Promise<Admin> {
        if (item) {
            try {
                item.total_admins = await this._userRepository.countAdmins()
                item.total_holders = await this._userRepository.countHolders()
                item.total_dependents = await this._userRepository.countDependents()
            } catch (err) {
                return Promise.reject(err)
            }
        }

        return Promise.resolve(item)
    }
}
