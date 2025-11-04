import { Identifier } from '../../di/identifiers';
import { inject, injectable } from 'inversify'
import { IHolderRepository } from '../../application/port/holder.repository.interface';
import { IHolderService } from '../../application/port/holder.service.interface';
import { Holder } from '../../application/domain/model/holder';
import { IQuery } from '../../application/port/query.interface';
import { CreateHolderValidator } from '../../application/domain/validator/create.holder.validator';
import { ConflictException } from '../../application/domain/exception/conflict.exception';
import { Strings } from '../../utils/strings';
import { ObjectIdValidator } from '../../application/domain/validator/object.id.validator';
import { UserType } from '../../application/domain/utils/user.type';
import { IUserRepository } from 'application/port/user.repository.interface';
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { UpdateHolderValidator } from '../../application/domain/validator/update.holder.validator';
import { ValidationException } from "../../application/domain/exception/validation.exception";
import { Email } from '../domain/model/email'
import { EmailWelcomeEvent } from '../integration-event/event/email.welcome.event'
import { Default } from '../../utils/default'


@injectable()
export class HolderService implements IHolderService {
    constructor(
        @inject(Identifier.HOLDER_REPOSITORY) private readonly _holderRepository: IHolderRepository,
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepo: IIntegrationEventRepository
    ) {
    }

    public async add(item: Holder): Promise<Holder | undefined> {
        try {
            CreateHolderValidator.validate(item);
            const passwordWithoutCrypt: string = item.password!

            const exists = await this._holderRepository.checkExists(item)
            if (exists) throw new ConflictException(Strings.USER.EMAIL_ALREADY_REGISTERED)

            const result: Holder | undefined = await this._holderRepository.create(item)
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
            return Promise.reject(err);
        }
    }

    public async getAll(query: IQuery): Promise<Array<Holder>> {
        return this._holderRepository.find(query)
    }

    public async getById(id: string, query: IQuery): Promise<Holder | undefined> {
        try {
            ObjectIdValidator.validate(id)
            query.addFilter({ _id: id, type: UserType.HOLDER })
            return this._holderRepository.findOne(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async update(item: Holder): Promise<Holder | undefined> {
        try {
            UpdateHolderValidator.validate(item)

            const holderExists: boolean = await this._userRepository.checkExistsByIdAndType(item.id!, UserType.HOLDER)
            if (!holderExists) return Promise.resolve(undefined)

            item.last_login = undefined
            return this._holderRepository.update(item)
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async remove(id: string): Promise<boolean> {
        try {
            ObjectIdValidator.validate(id)
            const holder: Holder | undefined = await this._holderRepository.findOneById(id)
            if (!holder) return Promise.resolve(false)
            return this._holderRepository.delete(id)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async count(query: IQuery): Promise<number> {
        try {
            return this._holderRepository.count(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async associateDependent(holderId: string, dependentId: string): Promise<boolean | undefined> {
        try {
            ObjectIdValidator.validate(holderId, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(dependentId, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)

            const holderExists: boolean =
                await this._userRepository.checkExistsByIdAndType(holderId, UserType.HOLDER)
            if (!holderExists) {
                throw new ValidationException(
                    Strings.HOLDER.NOT_FOUND,
                    Strings.HOLDER.NOT_FOUND_DESCRIPTION
                )
            }

            const dependentExists: boolean =
                await this._userRepository.checkExistsByIdAndType(dependentId, UserType.DEPENDENT)
            if (!dependentExists) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_FOUND,
                    Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
                )
            }

            return this._holderRepository.associateDependent(holderId, dependentId)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async checkAssociation(holderId: string, dependentId: string): Promise<boolean | undefined> {
        try {
            ObjectIdValidator.validate(holderId, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(dependentId, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)

            const holderExists: boolean =
                await this._userRepository.checkExistsByIdAndType(holderId, UserType.HOLDER)
            if (!holderExists) {
                throw new ValidationException(
                    Strings.HOLDER.NOT_FOUND,
                    Strings.HOLDER.NOT_FOUND_DESCRIPTION
                )
            }

            const dependentExists: boolean =
                await this._userRepository.checkExistsByIdAndType(dependentId, UserType.DEPENDENT)
            if (!dependentExists) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_FOUND,
                    Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
                )
            }

            const checkAssociation: boolean | undefined =
                await this._holderRepository.checkDependentIsAssociated(holderId, dependentId)
            if (!checkAssociation) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_ASSOCIATED,
                    Strings.DEPENDENT.NOT_ASSOCIATED_DESCRIPTION
                )
            }

            return checkAssociation
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async removeAssociationWithDependent(holderId: string, dependentId: string): Promise<Holder | undefined> {
        try {
            ObjectIdValidator.validate(holderId, Strings.HOLDER.PARAM_ID_NOT_VALID_FORMAT)
            ObjectIdValidator.validate(dependentId, Strings.DEPENDENT.PARAM_ID_NOT_VALID_FORMAT)

            const holderExists: boolean =
                await this._userRepository.checkExistsByIdAndType(holderId, UserType.HOLDER)
            if (!holderExists) {
                throw new ValidationException(
                    Strings.HOLDER.NOT_FOUND,
                    Strings.HOLDER.NOT_FOUND_DESCRIPTION
                )
            }

            const dependentExists: boolean =
                await this._userRepository.checkExistsByIdAndType(dependentId, UserType.DEPENDENT)
            if (!dependentExists) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_FOUND,
                    Strings.DEPENDENT.NOT_FOUND_DESCRIPTION
                )
            }

            const checkAssociation: boolean =
                await this._holderRepository.checkDependentIsAssociated(holderId, dependentId)
            if (!checkAssociation) {
                throw new ValidationException(
                    Strings.DEPENDENT.NOT_ASSOCIATED,
                    Strings.DEPENDENT.NOT_ASSOCIATED_DESCRIPTION
                )
            }

            return this._holderRepository.removeAssociationDependentById(holderId, dependentId)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
