import { Connection } from 'mongoose'
import { inject, injectable } from 'inversify'
import { IConnectionFactory, IDBOptions } from '../port/connection.factory.interface'
import { Identifier } from '../../di/identifiers'
import { IConnectionDB } from '../port/connection.db.interface'
import { ILogger } from '../../utils/custom.logger'
import { EventEmitter } from 'events'


@injectable()
export class ConnectionMongodb implements IConnectionDB {
    private _connection?: Connection
    private _eventConnection: EventEmitter

    constructor(
        @inject(Identifier.MONGODB_CONNECTION_FACTORY) private readonly _connectionFactory: IConnectionFactory,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
        this._eventConnection = new EventEmitter()
    }

    get eventConnection(): EventEmitter {
        return this._eventConnection
    }

    public async tryConnect(uri: string, options?: IDBOptions): Promise<void> {
        try {
            const connection: Connection = await this._connectionFactory.createConnection(uri, options);

            this._connection = connection;
            this.connectionStatusListener(this._connection);
            this._eventConnection.emit('connected');
            this._logger.info('MongoDB connection established!');
        } catch (err: unknown) {
            const error = err as Error;
            this._connection = undefined;
            this._eventConnection.emit('disconnected');
            this._logger.warn(`Error trying to connect for the first time with mongoDB: ${error.message}`);

            setTimeout(() => {
                this.tryConnect(uri, options);
            }, 2000);
        }
    }

    private connectionStatusListener(connection: Connection | undefined): void {
        if (!connection) {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            return
        }

        connection.on('connected', (con) => {
            setTimeout(() => {
                this._logger.info('MongoDB connection re-established!')
                this._eventConnection.emit('connected', con)
            }, 1000)
        })

        connection.on('disconnected', () => {
            this._connection = undefined
            this._eventConnection.emit('disconnected')
            this._logger.warn('MongoDB connection has been lost...')
        })
    }

    public async dispose(): Promise<void> {
        if (this._connection) await this._connection.close()
        this._connection = undefined
    }
}
