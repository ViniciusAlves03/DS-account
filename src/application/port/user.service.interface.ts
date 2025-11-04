import { IService } from './service.interface'
import { User } from '../domain/model/user'
import { Image } from '../domain/model/image'


export interface IUserService extends IService<User> {
    addOrUpdateAvatar(item: Image): Promise<Image>

    getAvatar(id: string): Promise<Image | undefined>

    deleteAvatar(id: string): Promise<boolean>
}
