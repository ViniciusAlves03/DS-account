import { EventType, IntegrationEvent } from './integration.event'
import { Email } from '../../domain/model/email'


export class EmailUpdatePasswordEvent extends IntegrationEvent<Email> {
    public static readonly ROUTING_KEY: string = 'emails.update-password'
    public static readonly NAME: string = 'EmailUpdatePasswordEvent'

    constructor(public timestamp?: Date, public email?: Email) {
        super(EmailUpdatePasswordEvent.NAME, EventType.EMAIL, timestamp)
    }

    public toJSON(): any {
        if (!this.email) return {}
        return {
            ...super.toJSON(),
            email: {
                ...this.email.toJSON()
            }
        }
    }
}
