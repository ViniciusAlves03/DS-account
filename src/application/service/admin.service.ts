import { IAdminService } from '../port/admin.service.interface'
import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IAdminRepository } from '../port/admin.repository.interface'
import { IQuery } from '../port/query.interface'
import { Admin } from '../domain/model/admin'
import { CreateAdminValidator } from '../domain/validator/create.admin.validator'
import { UserType } from '../domain/utils/user.type'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { UpdateAdminValidator } from '../domain/validator/update.admin.validator'
import { IUserRepository } from '../port/user.repository.interface'
import { Strings } from '../../utils/strings'
import { ConflictException } from '../domain/exception/conflict.exception'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { Email } from '../domain/model/email'
import { EmailWelcomeEvent } from '../integration-event/event/email.welcome.event'
import { Default } from '../../utils/default'


@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(Identifier.ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepo: IIntegrationEventRepository
    ) {
    }

    public async add(item: Admin): Promise<Admin | undefined> {
        try {
            CreateAdminValidator.validate(item)
            const passwordWithoutCrypt: string = item.password!

            const exists = await this._userRepository.checkExists(item)
            if (exists) throw new ConflictException(Strings.USER.EMAIL_ALREADY_REGISTERED)

            const result: Admin | undefined = await this._adminRepository.create(item)
            if (result) {
                const mail: Email = new Email().fromJSON({
                    to: {
                        name: item.name,
                        email: item.email
                    },
                    password: passwordWithoutCrypt,
                    lang: item.language,
                    action_url: process.env.DASHBOARD_HOST || Default.DASHBOARD_HOST
                })
                await this._integrationEventRepo.publishEvent(
                    new EmailWelcomeEvent(new Date(), mail), EmailWelcomeEvent.ROUTING_KEY
                )
            }
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getAll(query: IQuery): Promise<Array<Admin>> {
        return this._adminRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Admin | undefined> {
        try {
            ObjectIdValidator.validate(id)
            query.addFilter({ _id: id, type: UserType.ADMIN })
            return this._adminRepository.findOne(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async update(item: Admin): Promise<Admin | undefined> {
        try {
            UpdateAdminValidator.validate(item)

            const adminExists: boolean = await this._userRepository.checkExistsByIdAndType(item.id!, UserType.ADMIN)
            if (!adminExists) return Promise.resolve(undefined)

            if (item.email) {
                const exists = await this._userRepository.checkExists(item)
                if (exists) throw new ConflictException(Strings.USER.EMAIL_ALREADY_REGISTERED)
            }
            item.last_login = undefined
            return this._adminRepository.update(item)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public remove(id: string): Promise<boolean> {
        throw new Error('Unsupported feature!')
    }

    public count(query: IQuery): Promise<number> {
        try {
            return this._adminRepository.count(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
