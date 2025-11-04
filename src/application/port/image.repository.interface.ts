import { IRepository } from './repository.interface'
import { Image } from '../domain/model/image'


export interface IImageRepository extends IRepository<Image> {
    createOrUpdate(userId: string, item: Image): Promise<Image>

    findOneById(_id: string): Promise<Image | undefined>

    findOneByUser(userId: string): Promise<Image | undefined>
}
