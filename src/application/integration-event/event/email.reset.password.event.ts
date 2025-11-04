import { EventType, IntegrationEvent } from './integration.event'
import { Email } from '../../domain/model/email'


export class EmailResetPasswordEvent extends IntegrationEvent<Email> {
    public static readonly ROUTING_KEY: string = 'emails.reset-password'
    public static readonly NAME: string = 'EmailResetPasswordEvent'

    constructor(public timestamp?: Date, public email?: Email) {
        super(EmailResetPasswordEvent.NAME, EventType.EMAIL, timestamp)
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
