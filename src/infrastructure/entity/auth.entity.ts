import { Entity } from './entity'


export class AuthEntity extends Entity {
    public access_token?: string
    public refresh_token?: any
    public expires_in?: number
    public scope?: string
    public token_type?: string
    public user_id?: string
}
