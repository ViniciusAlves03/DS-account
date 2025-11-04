import { EventType, IntegrationEvent } from './integration.event'
import { Email } from '../../domain/model/email'


export class EmailWelcomeEvent extends IntegrationEvent<Email> {
    public static readonly ROUTING_KEY: string = 'emails.welcome'
    public static readonly NAME: string = 'EmailWelcomeEvent'

    constructor(public timestamp?: Date, public email?: Email) {
        super(EmailWelcomeEvent.NAME, EventType.EMAIL, timestamp)
    }

    public toJSON(): any {
        if (!this.email) return {}
        return {
            ...super.toJSON(),
            ...{
                email: this.email.toJSON()
            }
        }
    }
}
