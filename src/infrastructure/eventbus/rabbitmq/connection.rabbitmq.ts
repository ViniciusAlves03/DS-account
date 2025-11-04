import { inject, injectable } from 'inversify'
import { Identifier } from '../../../di/identifiers'
import { EventBusException } from '../../../application/domain/exception/eventbus.exception'
import { IConnectionEventBus } from '../../port/connection.event.bus.interface'
import { IConnectionFactory, IEventBusOptions } from '../../port/connection.factory.interface'


@injectable()
export class ConnectionRabbitMQ implements IConnectionEventBus {
    private _connection!: any

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION_FACTORY) private readonly _connectionFactory: IConnectionFactory
    ) {
    }

    get isOpen(): boolean {
        return this._connection && this._connection.isOpen
    }

    public open(uri: string, options?: IEventBusOptions): Promise<IConnectionEventBus> {
        return new Promise<IConnectionEventBus>((resolve, reject) => {
            if (this._connection && this._connection.isOpen) return resolve(this._connection)

            this._connectionFactory
                .createConnection(uri, options)
                .then(connection => {
                    this._connection = connection
                    return resolve(this._connection)
                })
                .catch(err => {
                    return reject(err)
                })
        })
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this._connection.on(event, listener)
    }

    public publish(exchangeName: string, routingKey: string, message: any, options?: object): Promise<void> {
        if (!this.isOpen) return Promise.reject(new EventBusException('No connection open!'))
        return this._connection.pub(exchangeName, routingKey, message, options)
    }

    public subscribe(queueName: string, exchangeName: string, routingKey: string,
                     callback: (err: any, message: object) => void, options?: object): Promise<void> {
        if (!this.isOpen) return Promise.reject(new EventBusException('No connection open!'))
        return this._connection.sub(queueName, exchangeName, routingKey, callback, options)
    }

    public createRpcServer(queueName: string, exchangeName: string, routingKeys: string[], options?: object) {
        if (!this.isOpen) return Promise.reject(new EventBusException('No connection open!'))
        return this._connection.createRpcServer(queueName, exchangeName, routingKeys, options)
    }

    public rpcClient(exchangeName: string, resourceName: string, parameters: any[], options?: any): Promise<any> {
        if (!this.isOpen) return Promise.reject(new Error('Connection Failed'))
        return this._connection.rpcClient(exchangeName, resourceName, parameters, options)
    }

    public close(): Promise<boolean> {
        if (!this.isOpen) return Promise.resolve(true)
        return this._connection.close()
    }

    public dispose(): Promise<boolean> {
        if (!this.isOpen) return Promise.resolve(false)
        return this._connection.dispose()
    }
}
