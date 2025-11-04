import { inject, injectable } from "inversify";
import { Identifier } from '../../di/identifiers';
import { IDependentService } from "../../application/port/dependent.service.interface";
import { IDependentRepository } from '../../application/port/dependent.repository.interface';
import { IHolderRepository } from '../../application/port/holder.repository.interface';
import { Dependent } from "application/domain/model/dependent";
import { ConflictException } from '../../application/domain/exception/conflict.exception';
import { Strings } from '../../utils/strings';
import { IQuery } from "application/port/query.interface";
import { CreateDependentValidator } from "../../application/domain/validator/create.dependent.validator";
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator';
import { UserType } from '../../application/domain/utils/user.type';
import { IUserRepository } from 'application/port/user.repository.interface';
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { UpdateDependentValidator } from '../../application/domain/validator/update.dependent.validator';
import { ValidationException } from "../../application/domain/exception/validation.exception";
import { BooleanValidator } from '../../application/domain/validator/boolean.validator';
import { Email } from '../domain/model/email'
import { EmailWelcomeEvent } from '../integration-event/event/email.welcome.event'
import { Default } from '../../utils/default'


@injectable()
export class DependentService implements IDependentService {
    constructor(
        @inject(Identifier.DEPENDENT_REPOSITORY) private readonly _dependentRepository: IDependentRepository,
        @inject(Identifier.HOLDER_REPOSITORY) private readonly _holderRepository: IHolderRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepo: IIntegrationEventRepository
    ) {
    }

    public async add(item: Dependent): Promise<Dependent | undefined> {
        try {
            CreateDependentValidator.validate(item)
            const passwordWithoutCrypt: string = item.password!

            const exists = await this._dependentRepository.checkExists(item)
            if (exists) throw new ConflictException(Strings.USER.EMAIL_ALREADY_REGISTERED)

            const result: Dependent | undefined = await this._dependentRepository.create(item)
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

    public async getAll(query: IQuery): Promise<Dependent[]> {
        return this._dependentRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Dependent | undefined> {
        try {
            ObjectIdValidator.validate(id)
            query.addFilter({ _id: id, type: UserType.DEPENDENT })
            return this._dependentRepository.findOne(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async update(item: Dependent): Promise<Dependent | undefined> {
        try {
            UpdateDependentValidator.validate(item)

            const dependentExists: boolean = await this._userRepository.checkExistsByIdAndType(item.id!, UserType.DEPENDENT)
            if (!dependentExists) return Promise.resolve(undefined)

            item.last_login = undefined
            return this._dependentRepository.update(item)
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async remove(id: string): Promise<boolean> {
        try {
            ObjectIdValidator.validate(id)
            const dependent: Dependent | undefined = await this._dependentRepository.findOneById(id)
            if (!dependent) return Promise.resolve(false)

            await this._holderRepository.removeDependentById(id)

            return this._dependentRepository.delete(id)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async count(query: IQuery): Promise<number> {
        try {
            return this._userRepository.count(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async addDependent(item: Dependent, holderid: string): Promise<Dependent | undefined> {
        try {
            ObjectIdValidator.validate(holderid)

            const holderExists: boolean =
                await this._userRepository.checkExistsByIdAndType(holderid, UserType.HOLDER)
            if (!holderExists) {
                throw new ValidationException(
                    Strings.HOLDER.NOT_FOUND,
                    Strings.HOLDER.NOT_FOUND_DESCRIPTION
                )
            }
            return this.add(item)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async updateAuthorization(dependentId: string, isAuthorized: boolean): Promise<Dependent | undefined> {
        try {
            ObjectIdValidator.validate(dependentId, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)
            BooleanValidator.validate(isAuthorized)

            const dependentExists: boolean =
                await this._userRepository.checkExistsByIdAndType(dependentId, UserType.DEPENDENT)
            if (!dependentExists) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_FOUND,
                    Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
                )
            }
            return this._dependentRepository.updateAuthorization(dependentId, isAuthorized)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
