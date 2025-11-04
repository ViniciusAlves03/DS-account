import { injectable } from 'inversify'
import mongoose, { Connection, Mongoose } from 'mongoose'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'


@injectable()
export class ConnectionFactoryMongodb implements IConnectionFactory {
    public createConnection(uri: string, options?: IDBOptions): Promise<Connection> {
        return new Promise<Connection>((resolve, reject) => {
            mongoose.set('strictQuery', true)
            mongoose.connect(uri, options)
                .then((result: Mongoose) => resolve(result.connection))
                .catch(err => reject(err))
        })
    }
}
