import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Image } from '../../../application/domain/model/image'
import { ImageEntity } from '../image.entity'


@injectable()
export class ImageEntityMapper implements IEntityMapper<Image, ImageEntity> {
    public transform(item: any): any {
        if (item instanceof Image) return this.modelToModelEntity(item)
        return this.jsonToModel(item)
    }

    public modelToModelEntity(item: Image): ImageEntity {
        const result: ImageEntity = new ImageEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.content_type !== undefined) result.content_type = item.content_type
        if (item.filename !== undefined) result.filename = item.filename
        if (item.size !== undefined) result.size = item.size
        if (item.download_link !== undefined) result.download_link = item.download_link
        if (item.user_id !== undefined) result.user_id = item.user_id
        if (item.file_id !== undefined) result.file_id = item.file_id

        return result
    }

    public jsonToModel(json: any): Image {
        const result: Image = new Image()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.created_at !== undefined) result.created_at = json.created_at
        if (json.updated_at !== undefined) result.updated_at = json.updated_at
        if (json.content_type !== undefined) result.content_type = json.content_type
        if (json.filename !== undefined) result.filename = json.filename
        if (json.size !== undefined) result.size = json.size
        if (json.download_link !== undefined) result.download_link = json.download_link
        if (json.user_id !== undefined) result.user_id = json.user_id
        if (json.file_id !== undefined) result.file_id = json.file_id

        return result
    }
}
