import { Image } from '../domain/model/image'


export interface IFileRepository {
    create(item: Image): Promise<any>

    getFileBuffer(fileId: string): Promise<Buffer | undefined>

    delete(fileId: string): Promise<boolean>
}
