import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'
import { StrUtils } from '../utils/str.utils'


export class Address implements IJSONSerializable, IJSONDeserializable<Address> {
    private _street?: string
    private _number?: string
    private _complement?: string
    private _district?: string
    private _city?: string
    private _state?: string
    private _zip_code?: string

    get street(): string | undefined {
        return this._street
    }

    set street(value: string | undefined) {
        this._street = StrUtils.stripHtml(value)
    }

    get number(): string | undefined {
        return this._number
    }

    set number(value: string | undefined) {
        this._number = StrUtils.stripHtml(value)
    }

    get complement(): string | undefined {
        return this._complement
    }

    set complement(value: string | undefined) {
        this._complement = StrUtils.stripHtml(value)
    }

    get district(): string | undefined {
        return this._district
    }

    set district(value: string | undefined) {
        this._district = StrUtils.stripHtml(value)
    }

    get city(): string | undefined {
        return this._city
    }

    set city(value: string | undefined) {
        this._city = StrUtils.stripHtml(value)
    }

    get state(): string | undefined {
        return this._state
    }

    set state(value: string | undefined) {
        this._state = StrUtils.stripHtml(value)
    }

    get zip_code(): string | undefined {
        return this._zip_code
    }

    set zip_code(value: string | undefined) {
        this._zip_code = StrUtils.stripHtml(value)
    }

    public fromJSON(json: any): Address {
        if (!json) return this
        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.street !== undefined) this.street = json.street
        if (json.number !== undefined) this.number = json.number
        if (json.complement !== undefined) this.complement = json.complement
        if (json.district !== undefined) this.district = json.district
        if (json.city !== undefined) this.city = json.city
        if (json.state !== undefined) this.state = json.state
        if (json.zip_code !== undefined) this.zip_code = json.zip_code

        return this
    }

    public toJSON(): any {
        return {
            street: this.street,
            number: this.number,
            complement: this.complement,
            district: this.district,
            city: this.city,
            state: this.state,
            zip_code: this.zip_code
        }
    }
}
