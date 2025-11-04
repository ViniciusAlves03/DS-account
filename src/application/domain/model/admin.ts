import { User } from './user'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { UserType } from '../utils/user.type'
import { UsersScopes } from '../utils/users.scopes'


export class Admin extends User implements IJSONSerializable, IJSONDeserializable<Admin> {
    private _total_holders ?: number
    private _total_admins ?: number
    private _total_dependents ?: number

    constructor() {
        super()
        super.type = UserType.ADMIN
        super.scopes = UsersScopes.ADMIN
    }

    get total_holders(): number | undefined {
        return this._total_holders
    }

    set total_holders(value: number | undefined) {
        this._total_holders = value
    }

    get total_admins(): number | undefined {
        return this._total_admins
    }

    set total_admins(value: number | undefined) {
        this._total_admins = value
    }

    get total_dependents(): number | undefined {
        return this._total_dependents
    }

    set total_dependents(value: number | undefined) {
        this._total_dependents = value
    }

    public fromJSON(json: any): Admin {
        if (!json) return this
        super.fromJSON(json)
        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                total_holders: this.total_holders ? this.total_holders : 0,
                total_admins: this.total_admins ? this.total_admins : 0,
                total_dependents: this.total_dependents ? this.total_dependents : 0,
            }
        }
    }
}
