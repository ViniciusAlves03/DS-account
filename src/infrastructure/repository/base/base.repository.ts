import { injectable } from 'inversify'
import { IRepository } from '../../../application/port/repository.interface'
import { RepositoryException } from '../../../application/domain/exception/repository.exception'
import { Entity } from '../../../application/domain/model/entity'
import { ValidationException } from '../../../application/domain/exception/validation.exception'
import { ConflictException } from '../../../application/domain/exception/conflict.exception'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { IQuery } from '../../../application/port/query.interface'
import { ILogger } from '../../../utils/custom.logger'
import { Strings } from '../../../utils/strings'


@injectable()
export abstract class BaseRepository<T extends Entity, TModel> implements IRepository<T> {
    constructor(
        readonly Model: any,
        readonly mapper: IEntityMapper<T, TModel>,
        readonly logger: ILogger
    ) {
    }

    public async create(item: T): Promise<T | undefined> {
        const itemNew: TModel = this.mapper.transform(item);
        try {
            const result = await this.Model.create(itemNew);
            if (!result) return undefined;
            return this.mapper.transform(result);
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err);
        }
    }

    public async find(query: IQuery): Promise<Array<T>> {
        const q: any = query.toJSON()
        try {
            const result: Array<TModel> = await this.Model.find(q.filters)
                .select(q.fields)
                .sort(q.ordination)
                .skip(Number((q.pagination.limit * q.pagination.page) - q.pagination.limit))
                .limit(Number(q.pagination.limit))
                .exec()

            return result.map(item => this.mapper.transform(item))
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err)
        }
    }

    public async findOne(query: IQuery): Promise<T | undefined> {
        const q: any = query.toJSON()
        try {
            const result: TModel | null = await this.Model.findOne(q.filters)
                .select(q.fields)
                .exec()

            if (!result) return undefined
            return this.mapper.transform(result)
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err)
        }
    }

    public async update(item: T): Promise<T | undefined> {
        const itemUp: any = this.mapper.transform(item)
        try {
            const result: TModel | null = await this.Model.findOneAndUpdate({ _id: itemUp.id }, itemUp, { new: true })
                .exec()

            if (!result) return undefined
            return this.mapper.transform(result)
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err)
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const result: TModel | null = await this.Model.findOneAndDelete({ _id: id })
                .exec()

            return !!result
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err)
        }
    }

    public async count(query?: IQuery): Promise<number> {
        try {
            const result: number = await this.Model.countDocuments(query ? query.toJSON().filters : {})
                .exec()
            return result
        } catch (err: unknown) {
            throw this.mongoDBErrorListener(err)
        }
    }

    protected mongoDBErrorListener(err: unknown): ValidationException | ConflictException | RepositoryException {
        if (err && typeof err === 'object' && 'name' in err) {
            const error = err as { name: string; message: string; code?: number; kind?: string; value?: any; path?: string; description?: string };

            if (error.name === 'ValidationError') {
                return new ValidationException('Required fields were not provided!', error.message)
            } else if (error.name === 'CastError' || new RegExp(/(invalid format)/i).test(error.message)) {
                if (error.name === 'CastError' && error.kind) {
                    if (error.kind === 'date') {
                        return new ValidationException(
                            Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT.replace('{0}', error.value),
                            Strings.ERROR_MESSAGE.DATE.INVALID_DATETIME_FORMAT_DESC
                        )
                    } else if (error.kind === 'ObjectId') {
                        return new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.UUID_NOT_VALID_FORMAT,
                            Strings.ERROR_MESSAGE.VALIDATE.UUID_NOT_VALID_FORMAT_DESC)
                    } else if (error.kind === 'Boolean') {
                        return new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_BOOLEAN.replace('{0}', error.path))
                    } else if (error.kind === 'Number') {
                        return new ValidationException(Strings.ERROR_MESSAGE.VALIDATE.INVALID_NUMBER.replace('{0}', error.path))
                    }
                }
                return new ValidationException(`The value \'${error.value}\' of ${error.path} field is invalid.`)
            } else if (error.name === 'MongoError' && error.code === 11000) {
                return new ConflictException('A registration with the same unique data already exists!')
            } else if (error.name === 'ObjectParameterError') {
                return new ValidationException('Invalid query parameters!')
            }
        }

        const message = (err && typeof err === 'object' && 'message' in err) ? String((err as any).message) : Strings.ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
        const description = (err && typeof err === 'object' && 'description' in err) ? String((err as any).description) : undefined;

        return new RepositoryException(message, description);
    }
}
