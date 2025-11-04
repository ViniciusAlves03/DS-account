import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { StrUtils } from '../utils/str.utils'


export class Credentials implements IJSONSerializable, IJSONDeserializable<Credentials> {
    private _login: string | undefined
    private _password!: string | undefined

    get login(): string | undefined {
        return this._login
    }

    set login(value: string | undefined) {
        this._login = StrUtils.stripHtml(value)
    }

    get password(): string | undefined {
        return this._password
    }

    set password(value: string | undefined) {
        this._password = StrUtils.stripHtml(value)
    }

    public fromJSON(json: any): Credentials {
        if (!json) return this

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.login !== undefined) this.login = json.login
        if (json.password !== undefined) this.password = json.password

        return this
    }

    public toJSON(): any {
        return {
            login: this.login,
            password: this.password
        }
    }
}
