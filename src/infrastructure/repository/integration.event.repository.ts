import { inject, injectable } from 'inversify'
import { Identifier } from '../../di/identifiers'
import { IIntegrationEventRepository } from '../../application/port/integration.event.repository.interface'
import { IQuery } from '../../application/port/query.interface'
import { RepositoryException } from '../../application/domain/exception/repository.exception'
import { IntegrationEvent } from '../../application/integration-event/event/integration.event'
import { IEventBus } from '../port/event.bus.interface'
import { ILogger } from '../../utils/custom.logger'


@injectable()
export class IntegrationEventRepository implements IIntegrationEventRepository {
    constructor(
        @inject(Identifier.INTEGRATION_EVENT_REPO_MODEL) readonly _integrationEventModel: any,
        @inject(Identifier.RABBITMQ_EVENT_BUS) private readonly _eventBus: IEventBus,
        @inject(Identifier.LOGGER) private readonly _logger: ILogger
    ) {
    }

    public async create(item: any): Promise<IntegrationEvent<any>> {
        try {
            const result = await this._integrationEventModel.create(item)
            return result
        } catch (err: unknown) {
            const error = err as { message: string, description?: string }
            throw new RepositoryException(error.message, error.description)
        }
    }

    public async find(query: IQuery): Promise<Array<IntegrationEvent<any>>> {
        query.addOrdination('created_at', 'desc')

        const q: any = query.toJSON()
        try {
            const result = await this._integrationEventModel.find(q.filters)
                .sort(q.ordination)
                .exec()

            return result
        } catch (err: unknown) {
            const error = err as { message: string, description?: string }
            throw new RepositoryException(error.message, error.description)
        }
    }

    public findOne(query: IQuery): Promise<IntegrationEvent<any>> {
        throw new Error('Not implemented!')
    }

    public update(item: object): Promise<IntegrationEvent<any>> {
        throw new Error('Not implemented!')
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const result = await this._integrationEventModel.findOneAndDelete({ _id: id })
                .exec()

            return !!result
        } catch (err: unknown) {
            const error = err as { message: string, description?: string }
            throw new RepositoryException(error.message, error.description)
        }
    }

    public count(query: IQuery): Promise<number> {
        throw new Error('Not implemented!')
    }

    public async publishEvent(event: IntegrationEvent<any>, routingKey: string): Promise<void> {
        const integrationEvent = async () => {
            try {
                const saveEvent: any = event.toJSON()
                await this.create({
                    ...saveEvent,
                    __routing_key: routingKey,
                    __operation: 'publish'
                })
                this._logger.warn(`Event ${event.event_name} was saved in the database for a possible recovery.`)
            } catch (dbErr: unknown) {
                const error = dbErr as Error
                this._logger.error(`There was an error trying to save the event ${event.event_name}.`
                    .concat(`Error: ${error.message}. Event: ${JSON.stringify(event.toJSON())}`))
            }
        }

        try {
            await this._eventBus.publish(event, routingKey)
            this._logger
                .info(`Event ${event.event_name} was successfully published on the message bus!`)
        } catch (publishErr: unknown) {
            const error = publishErr as Error
            this._logger.warn(`Error publish event: ${event.event_name}. ${error.message}`)
            await integrationEvent()
        }
    }
}
