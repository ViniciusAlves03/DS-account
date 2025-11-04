import { inject, injectable } from 'inversify'
import { Identifier } from '../di/identifiers'
import { IConnectionDB } from '../infrastructure/port/connection.db.interface'
import { IEventBus } from '../infrastructure/port/event.bus.interface'
import { IBackgroundTask } from '../application/port/background.task.interface'
import { Config } from '../utils/config'
import { ILogger } from '../utils/custom.logger'


@injectable()
export class BackgroundService {

    constructor(
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.MONGODB_CONNECTION) private readonly _mongodb: IConnectionDB,
        @inject(Identifier.PUBLISH_EVENT_BUS_TASK) private readonly _publishTask: IBackgroundTask,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async startServices(): Promise<void> {
        try {
            const dbConfigs = Config.getMongoConfig()
            await this._mongodb.tryConnect(dbConfigs.uri, dbConfigs.options)

            this._startTasks()
        } catch (err: any) {
            return Promise.reject(new Error(`Error initializing services in background! ${err.message}`))
        }
    }

    public async stopServices(): Promise<void> {
        try {
            await this._mongodb.dispose()
            await this._eventBus.dispose()
        } catch (err: any) {
            return Promise.reject(new Error(`Error stopping services in background! ${err.message}`))
        }
    }

    private _startTasks(): void {
        const rabbitConfigs = Config.getRabbitConfig()

        this._eventBus
            .connectionPub
            .open(rabbitConfigs.uri, rabbitConfigs.options)
            .then((conn) => {
                this._logger.info('Publish connection established!')

                conn.on('disconnected', () => this._logger.warn('Publish connection has been lost...'))
                conn.on('reestablished', () => {
                    this._logger.info('Publish connection re-established!')
                    // When the connection has been lost and reestablished the task will be executed again
                    this._publishTask.run()
                })

                this._publishTask.run()
            })
            .catch(err => {
                this._logger.error(`Error trying to get connection to Event Bus for event publishing. ${err.message}`)
            })
    }
}
