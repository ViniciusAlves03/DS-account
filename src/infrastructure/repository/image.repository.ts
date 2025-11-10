import { inject, injectable } from 'inversify'
import { BaseRepository } from './base/base.repository'
import { Identifier } from '../../di/identifiers'
import { IEntityMapper } from '../port/entity.mapper.interface'
import { IImageRepository } from '../../application/port/image.repository.interface'
import { ImageEntity } from '../entity/image.entity'
import { Image } from '../../application/domain/model/image'
import { Query } from './query/query'


@injectable()
export class ImageRepository extends BaseRepository<Image, ImageEntity> implements IImageRepository {
    constructor(
        @inject(Identifier.IMAGE_REPO_MODEL) readonly _imageModel: any,
        @inject(Identifier.IMAGE_ENTITY_MAPPER) readonly _imageMapper: IEntityMapper<Image, ImageEntity>,
        @inject(Identifier.LOGGER) readonly _logger: any
    ) {
        super(_imageModel, _imageMapper, _logger)
    }

    public async createOrUpdate(userId: string, item: Image): Promise<Image> {
        const itemUp: any = this._imageMapper.transform(item);
        try {
            const result: ImageEntity | null = await this._imageModel.findOneAndUpdate(
                { user_id: userId },
                itemUp,
                { new: true, upsert: true, setDefaultsOnInsert: true }
            ).exec();

            if (!result) {
                 throw new Error('Failed to create or update image.');
            }

            return this._imageMapper.transform(result);
        } catch (err: unknown) {
            throw super.mongoDBErrorListener(err);
        }
    }

    public findOneById(_id: string): Promise<Image | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { _id } }))
    }

    public findOneByUser(userId: string): Promise<Image | undefined> {
        return super.findOne(new Query().fromJSON({ filters: { user_id: userId } }))
    }
}
