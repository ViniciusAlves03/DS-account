import { injectable } from 'inversify'
import { amqpClient } from 'amqp-client-node'
import { IConnectionFactory, IEventBusOptions } from '../../port/connection.factory.interface'


@injectable()
export class ConnectionFactoryRabbitMQ implements IConnectionFactory {
    private readonly _options = {
        retries: 0,
        interval: 2000
    }

    public async createConnection(uri: string, options?: IEventBusOptions): Promise<any> {
        return amqpClient.createConnection(uri, { ...this._options, ...options })
    }
}
