import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { User } from '../domain/model/user'
import { Holder } from '../domain/model/holder'
import { UserType } from '../domain/utils/user.type'
import { Image } from '../domain/model/image'
import { ObjectIdValidator } from '../domain/validator/object.id.validator'
import { IQuery } from '../port/query.interface'
import { IUserRepository } from '../port/user.repository.interface'
import { IHolderRepository } from '../port/holder.repository.interface'
import { IUserService } from '../port/user.service.interface'
import { IDependentService } from '../port/dependent.service.interface'
import { IImageRepository } from '../port/image.repository.interface'
import { IFileRepository } from '../port/file.repository.interface'
import { IIntegrationEventRepository } from '../port/integration.event.repository.interface'
import { UserDeleteEvent } from '../integration-event/event/user.delete.event'
import { CreateAvatarValidator } from '../domain/validator/create.avatar.validator'
import { ValidationException } from '../domain/exception/validation.exception'
import { Strings } from '../../utils/strings'


@injectable()
export class UserService implements IUserService {
    constructor(
        @inject(Identifier.USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @inject(Identifier.HOLDER_REPOSITORY) private readonly _holderRepository: IHolderRepository,
        @inject(Identifier.DEPENDENT_SERVICE) private readonly _dependentService: IDependentService,
        @inject(Identifier.FILE_REPOSITORY) private readonly _fileRepo: IFileRepository,
        @inject(Identifier.IMAGE_REPOSITORY) private readonly _imageRepo: IImageRepository,
        @inject(Identifier.INTEGRATION_EVENT_REPOSITORY) private readonly _integrationEventRepo: IIntegrationEventRepository
    ) {
    }

    public add(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    public getAll(query: IQuery): Promise<Array<User>> {
        return this._userRepository.find(query)
    }

    public getById(id: string, query: IQuery): Promise<User> {
        throw Error('Not implemented!')
    }

    public update(item: User): Promise<User> {
        throw Error('Not implemented!')
    }

    public async remove(id: string): Promise<boolean> {
        try {
            ObjectIdValidator.validate(id)
            let result: boolean = false
            const user: User | undefined = await this._userRepository.findOneById(id)
            if (!user) return Promise.resolve(false)

            if (user.type === UserType.HOLDER) {
                const holder: Holder | undefined = await this._holderRepository.findOneById(id)
                if (holder?.dependents && holder.dependents.length) {
                    throw new ValidationException(
                        Strings.HOLDER.CANNOT_BE_REMOVED,
                        Strings.HOLDER.CANNOT_BE_REMOVED_DESC
                    )
                }
                result = await this._userRepository.delete(id)
            }
            if (user.type === UserType.DEPENDENT) {
                result = await this._dependentService.remove(id)
            }
            else {
                result = await this._userRepository.delete(id)
            }
            if (result){
                await this.deleteAvatar(id)
                await this._integrationEventRepo.publishEvent(
                    new UserDeleteEvent(new Date(), user), UserDeleteEvent.ROUTING_KEY
                )
            }
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public count(query: IQuery): Promise<number> {
        try {
            return this._userRepository.count(query)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async addOrUpdateAvatar(item: Image): Promise<Image> {
        try {
            CreateAvatarValidator.validate(item)
            const user: User | undefined = await this._userRepository.findOneById(item.user_id!)
            if (!user) throw new ValidationException(
                'The operation could not be completed because the user not exists.')

            item.filename = item.filename!.split(' ').join('_')

            const exists: Image | undefined = await this._imageRepo.findOneByUser(item.user_id!)
            if (exists && exists.file_id) await this._fileRepo.delete(exists.file_id)

            const file: any = await this._fileRepo.create(item)
            if (file) item.file_id = file._id.toString()

            const result: Image = await this._imageRepo.createOrUpdate(item.user_id!, item)
            result.download_link = user.getAvatarLink()
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async getAvatar(id: string): Promise<Image | undefined> {
        try {
            ObjectIdValidator.validate(id)
            const result: Image | undefined = await this._imageRepo.findOneByUser(id)
            if (!result) return Promise.resolve(result)
            result.data = await this._fileRepo.getFileBuffer(result.file_id!)
            return Promise.resolve(result)
        } catch (err) {
            return Promise.reject(err)
        }
    }

    public async deleteAvatar(id: string): Promise<boolean> {
        try {
            const image: Image | undefined = await this._imageRepo.findOneByUser(id)
            if (!image) return Promise.resolve(!!image)
            const isDeleted: boolean = await this._fileRepo.delete(image.file_id!)
            if (!isDeleted) return Promise.resolve(isDeleted)
            return this._imageRepo.delete(image.id!)
        } catch (err) {
            return Promise.reject(err)
        }
    }
}
