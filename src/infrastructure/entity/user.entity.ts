import { Entity } from './entity'


export class UserEntity extends Entity {
    public name?: string
    public birth_date?: string
    public gender?: string
    public phone_number?: string
    public language?: string
    public last_login?: Date
    public type?: string
    public check_email?: boolean
    public change_password?: boolean
    public email?: string
    public password?: string
    public reset_password_token?: string
    public protected?: boolean
}
