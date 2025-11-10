import { injectable } from 'inversify'
import mongoose, { Connection, Mongoose } from 'mongoose'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'


@injectable()
export class ConnectionFactoryMongodb implements IConnectionFactory {
    public async createConnection(uri: string, options?: IDBOptions): Promise<Connection> {
        try {
            mongoose.set('strictQuery', true)
            const result: Mongoose = await mongoose.connect(uri, options)
            return result.connection
        } catch (err: unknown) {
            throw err
        }
    }
}
