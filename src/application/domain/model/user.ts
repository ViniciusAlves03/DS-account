import { Entity } from './entity'
import { JsonUtils } from '../utils/json.utils'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { DatetimeValidator } from '../validator/date.time.validator'
import { StrUtils } from '../utils/str.utils'


export class User extends Entity implements IJSONSerializable, IJSONDeserializable<User> {
    private _avatar?: string
    private _name?: string
    private _birth_date?: string
    private _gender?: string
    private _phone_number?: string
    private _language?: string
    private _last_login?: Date
    private _type?: string
    private _check_email?: boolean
    private _change_password?: boolean
    private _email?: string
    private _password?: string
    private _scopes!: Array<string>
    private _reset_password_token?: string
    private _protected?: boolean

    constructor() {
        super()
    }

    get avatar(): string | undefined {
        return this._avatar
    }

    set avatar(value: string | undefined) {
        this._avatar = value
    }

    get name(): string | undefined {
        return this._name
    }

    set name(value: string | undefined) {
        this._name = value
    }

    get birth_date(): string | undefined {
        return this._birth_date
    }

    set birth_date(value: string | undefined) {
        this._birth_date = value
    }

    get gender(): string | undefined {
        return this._gender
    }

    set gender(value: string | undefined) {
        this._gender = value
    }

    get phone_number(): string | undefined {
        return this._phone_number
    }

    set phone_number(value: string | undefined) {
        this._phone_number = StrUtils.stripHtml(value)
    }

    get language(): string | undefined {
        return this._language
    }

    set language(value: string | undefined) {
        this._language = StrUtils.stripHtml(value)
    }

    get last_login(): Date | undefined {
        return this._last_login
    }

    set last_login(value: Date | undefined) {
        this._last_login = value
    }

    get type(): string | undefined {
        return this._type
    }

    set type(value: string | undefined) {
        this._type = value
    }

    get check_email(): boolean | undefined {
        return this._check_email
    }

    set check_email(value: boolean | undefined) {
        this._check_email = value
    }

    get change_password(): boolean | undefined {
        return this._change_password
    }

    set change_password(value: boolean | undefined) {
        this._change_password = value
    }

    get email(): string | undefined {
        return this._email
    }

    set email(value: string | undefined) {
        this._email = value
    }

    get password(): string | undefined {
        return this._password
    }

    set password(value: string | undefined) {
        this._password = value
    }

    get scopes(): Array<string> {
        return this._scopes
    }

    set scopes(value: Array<string>) {
        this._scopes = value
    }

    get reset_password_token(): string | undefined {
        return this._reset_password_token
    }

    set reset_password_token(value: string | undefined) {
        this._reset_password_token = value
    }

    get protected(): boolean | undefined {
        return this._protected
    }

    set protected(value: boolean | undefined) {
        this._protected = value
    }

    public addScope(scope: string): void {
        if (!this.scopes) this._scopes = []
        if (scope) this._scopes.push(scope)
    }

    public removeScope(scope: string): void {
        if (scope) {
            this.scopes = this.scopes.filter(item => item !== scope)
        }
    }

    public convertDatetimeString(value: any): Date {
        if (typeof value !== 'string') value = new Date(value).toISOString()
        DatetimeValidator.validate(value)
        return new Date(value)
    }

    public fromJSON(json: any): User {
        if (!json) return this
        if (typeof json === 'string') {
            if (!JsonUtils.isJsonString(json)) {
                super.id = json
                return this
            } else {
                json = JSON.parse(json)
            }
        }

        if (json.avatar) this.avatar = json.avatar
        if (json.name) this.name = json.name
        if (json.birth_date) this.birth_date = json.birth_date
        if (json.gender) this.gender = json.gender
        if (json.phone_number !== undefined) this.phone_number = json.phone_number
        if (json.language) this.language = json.language
        if (json.email !== undefined) this.email = json.email
        if (json.password !== undefined) this.password = json.password

        return this
    }

    public toJSON(): any {
        return {
            id: super.id ? super.id : undefined,
            created_at: super.created_at ? super.created_at : undefined,
            updated_at: super.updated_at ? super.updated_at : undefined,
            avatar: this.avatar ? this.avatar : undefined,
            name: this.name ? this.name : undefined,
            birth_date: this.birth_date ? this.birth_date : undefined,
            gender: this.gender ? this.gender : undefined,
            phone_number: this.phone_number ? this.phone_number : undefined,
            language: this.language ? this.language : undefined,
            email: this.email ? this.email : undefined,
            type: this.type ? this.type : undefined,
            last_login: this.last_login ? this.last_login : undefined,
        }
    }

    public getAvatarLink(): string {
        return `/v1/users/${this.id}/avatar`
    }
}
