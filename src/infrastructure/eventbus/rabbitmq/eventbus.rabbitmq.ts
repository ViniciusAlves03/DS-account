import { amqpClient } from 'amqp-client-node'
import { inject, injectable } from 'inversify'
import { EventBusException } from '../../../application/domain/exception/eventbus.exception'
import { IntegrationEvent } from '../../../application/integration-event/event/integration.event'
import { IIntegrationEventHandler } from '../../../application/integration-event/handler/integration.event.handler.interface'
import { Identifier } from '../../../di/identifiers'
import { Default } from '../../../utils/default'
import { IConnectionEventBus } from '../../port/connection.event.bus.interface'
import { IEventBus } from '../../port/event.bus.interface'


@injectable()
export class EventBusRabbitMQ implements IEventBus {
    private readonly RABBITMQ_QUEUE_NAME: string = 'expense'
    private readonly RABBITMQ_RPC_QUEUE_NAME: string = 'expense.rpc'
    private readonly RABBITMQ_RPC_EXCHANGE_NAME: string = 'expense.rpc'
    private _receiveFromYourself: boolean
    private _event_handlers: Map<string, IIntegrationEventHandler<IntegrationEvent<any>>>
    private _rpcServer!: any
    private _rpcServerInitialized: boolean

    constructor(
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionPub: IConnectionEventBus,
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionSub: IConnectionEventBus,
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionRpcServer: IConnectionEventBus,
        @inject(Identifier.RABBITMQ_CONNECTION) public connectionRpcClient: IConnectionEventBus
    ) {
        this._event_handlers = new Map()
        this._receiveFromYourself = false
        this._rpcServerInitialized = false
    }

    set receiveFromYourself(value: boolean) {
        this._receiveFromYourself = value
    }

    public async publish(event: IntegrationEvent<any>, routingKey: string): Promise<boolean> {
        if (!this.connectionPub.isOpen) {
            throw new EventBusException('No connection open!')
        }

        try {
            const message = { content: event.toJSON() }
            await this.connectionPub
                .publish(event.type, routingKey, message, {
                    exchange: {
                        type: 'topic',
                        durable: true
                    }
                })
            return true
        } catch (err: unknown) {
            throw err
        }
    }

    public async subscribe(event: IntegrationEvent<any>, handler: IIntegrationEventHandler<IntegrationEvent<any>>,
        routingKey: string): Promise<boolean> {

        if (!this.connectionSub.isOpen) {
            throw new EventBusException('No connection open!')
        }
        if (this._event_handlers.has(event.event_name)) {
            return true
        }

        this._event_handlers.set(event.event_name, handler)

        try {
            await this.connectionSub
                .subscribe(this.RABBITMQ_QUEUE_NAME, event.type, routingKey, (message) => {
                    message.ack()

                    const event_name: string = message.content.event_name
                    if (event_name) {
                        const event_handler: IIntegrationEventHandler<IntegrationEvent<any>> | undefined =
                            this._event_handlers.get(event_name)
                        if (event_handler) event_handler.handle(message.content)
                    }
                }, {
                    exchange: {
                        type: 'topic',
                        durable: true
                    },
                    queue: {
                        durable: true
                    },
                    consumer: {
                        noAck: false
                    },
                    receiveFromYourself: this._receiveFromYourself
                })

            return true
        } catch (err: unknown) {
            throw err
        }
    }

    public async provideResource(name: string, resource: (...any) => any): Promise<boolean> {
        if (!this.connectionRpcServer.isOpen) {
            throw new EventBusException('No connection open!')
        }

        this.initializeRPCServer()
        this._rpcServer.addResource(name, resource)

        try {
            await this._rpcServer.start()
            return true
        } catch (err: unknown) {
            throw err
        }
    }

    public executeResource(serviceName: string, resourceName: string, ...params: any[]): Promise<any> {
        if (!this.connectionRpcClient.isOpen)
            return Promise.reject(new EventBusException('No connection open!'))

        return this.connectionRpcClient
            .rpcClient(
                serviceName,
                resourceName,
                params,
                {
                    exchange: {
                        type: 'direct',
                        durable: true
                    },
                    rpcTimeout: Number(process.env.RABBITMQ_RPC_TIMEOUT) || Default.RABBITMQ_RPC_TIMEOUT
                })
    }

    private initializeRPCServer(): void {
        if (!this._rpcServerInitialized) {
            this._rpcServerInitialized = true
            this._rpcServer = this.connectionRpcServer
                .createRpcServer(
                    this.RABBITMQ_RPC_QUEUE_NAME,
                    this.RABBITMQ_RPC_EXCHANGE_NAME,
                    [],
                    {
                        exchange: {
                            type: 'direct',
                            durable: true
                        }, queue: {
                            expires: 5000
                        }
                    })
        }
    }

    public async dispose(): Promise<void> {
        if (this.connectionPub) await this.connectionPub.close()
        if (this.connectionSub) await this.connectionSub.close()
        if (this.connectionRpcServer) await this.connectionRpcServer.close()
        if (this.connectionRpcClient) await this.connectionRpcClient.close()
        this._event_handlers.clear()
        return Promise.resolve()
    }

    public enableLogger(level?: string): void {
        amqpClient.logger(!level ? 'warn' : level)
    }
}
