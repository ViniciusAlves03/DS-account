import { inject, injectable } from 'inversify';
import { Identifier } from '../../di/identifiers';
import { IFileRepository } from '../../application/port/file.repository.interface';
import { RepositoryException } from '../../application/domain/exception/repository.exception';
import { Image } from '../../application/domain/model/image';
import { GridFSBucket, Db, GridFSBucketWriteStream, ObjectId } from 'mongodb';
import { Readable } from 'stream';


@injectable()
export class FileRepository implements IFileRepository {
    private _gridFsBucket?: GridFSBucket;

    constructor(
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: any
    ) {
        this._mongodb.eventConnection.on('connected', () => {
            const db: Db = this._mongodb._connection.db;
            this._gridFsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
        });
    }

    private get bucket(): GridFSBucket {
        if (!this._gridFsBucket) {
            throw new RepositoryException('GridFS Bucket not initialized. Wait for MongoDB connection.');
        }
        return this._gridFsBucket;
    }

    public create(image: Image): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const uploadStream: GridFSBucketWriteStream = this.bucket.openUploadStream(image.filename!, {
                contentType: image.content_type
            });

            const bufferStream = new Readable();
            bufferStream.push(image.data);
            bufferStream.push(null);

            uploadStream.on('error', (err) => {
                return reject(new RepositoryException('An error occurs when saving the file.', err.message));
            });

            uploadStream.on('finish', () => {
                return resolve({
                    _id: uploadStream.id,
                    filename: uploadStream.filename,
                    contentType: uploadStream.options.contentType
                });
            });

            bufferStream.pipe(uploadStream);
        });
    }

    public getFileBuffer(fileId: string): Promise<Buffer | undefined> {
        return new Promise<Buffer | undefined>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const downloadStream = this.bucket.openDownloadStream(new ObjectId(fileId));

            downloadStream.on('data', (chunk) => {
                chunks.push(chunk as Buffer);
            });

            downloadStream.on('error', (err: any) => {
                if (err.code === 'ENOENT') {
                    return resolve(undefined);
                }
                return reject(new RepositoryException('An error occurs when retrieving the file.', err.message));
            });

            downloadStream.on('end', () => {
                return resolve(Buffer.concat(chunks));
            });
        });
    }

    public delete(fileId: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await this.bucket.delete(new ObjectId(fileId));
                return resolve(true);
            } catch (err: any) {
                return reject(new RepositoryException('An error occurs when deleting the file.', err.message));
            }
        });
    }
}

