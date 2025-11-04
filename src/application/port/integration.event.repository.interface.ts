import { IRepository } from './repository.interface'
import { IntegrationEvent } from '../integration-event/event/integration.event'


export interface IIntegrationEventRepository extends IRepository<IntegrationEvent<any>> {
    publishEvent(event: IntegrationEvent<any>, routingKey: string): void
}
