import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { RefreshToken } from './refresh.token'


export class Auth extends Entity implements IJSONSerializable, IJSONDeserializable<Auth> {
    private _access_token?: string
    private _refresh_token?: RefreshToken
    private _user_id?: string

    constructor() {
        super()
    }

    get access_token(): string | undefined {
        return this._access_token
    }

    set access_token(value: string | undefined) {
        this._access_token = value
    }

    get refresh_token(): RefreshToken | undefined {
        return this._refresh_token
    }

    set refresh_token(value: RefreshToken | undefined) {
        this._refresh_token = value
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    public fromJSON(json: any): Auth {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }
        if (json.id !== undefined) super.id = json.id
        if (json.created_at !== undefined) super.created_at = json.created_at
        if (json.access_token !== undefined) this.access_token = json.access_token
        if (json.refresh_token !== undefined) this.refresh_token = new RefreshToken().fromJSON(json.refresh_token)
        if (json.user_id !== undefined) this.user_id = json.user_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            created_at: super.created_at,
            access_token: this.access_token,
            refresh_token: this.refresh_token ? this.refresh_token.toJSON() : this.refresh_token,
            user_id: this.user_id
        }
    }
}
