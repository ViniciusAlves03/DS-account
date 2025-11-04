import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'


export class RefreshToken implements IJSONSerializable, IJSONDeserializable<RefreshToken> {
    private _hash?: string
    private _issued_at?: number
    private _expiration?: number

    get hash(): string | undefined {
        return this._hash
    }

    set hash(value: string | undefined) {
        this._hash = value
    }

    get issued_at(): number | undefined {
        return this._issued_at
    }

    set issued_at(value: number | undefined) {
        this._issued_at = value
    }

    get expiration(): number | undefined {
        return this._expiration
    }

    set expiration(value: number | undefined) {
        this._expiration = value
    }

    public fromJSON(json: any): RefreshToken {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.hash !== undefined) this.hash = json.hash
        if (json.issued_at !== undefined) this.issued_at = json.issued_at
        if (json.expiration !== undefined) this.expiration = json.expiration

        return this
    }

    public toJSON(): any {
        return {
            hash: this.hash,
            issued_at: this.issued_at,
            expiration: this.expiration
        }
    }

}
