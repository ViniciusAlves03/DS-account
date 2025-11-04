import { IJSONDeserializable } from "../utils/json.deserializable.interface"
import { IJSONSerializable } from "../utils/json.serializable.interface"
import { JsonUtils } from "../utils/json.utils"
import { StrUtils } from "../utils/str.utils"
import { UserType } from "../utils/user.type"
import { UsersScopes } from "../utils/users.scopes"
import { Address } from "./address"
import { User } from "./user"


export class Dependent extends User implements IJSONSerializable, IJSONDeserializable<Dependent> {
    private _address?: Address
    private _isAuthorized?: boolean

    constructor() {
        super()
        super.type = UserType.DEPENDENT
        super.scopes = UsersScopes.DEPENDENT
    }

    get address(): Address | undefined {
        return this._address
    }

    set address(value: Address | undefined) {
        this._address = value
    }

    get isAuthorized(): boolean | undefined {
        return this._isAuthorized
    }

    set isAuthorized(value: boolean | undefined) {
        this._isAuthorized = value
    }

    public fromJSON(json: any): Dependent {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.address !== undefined) this._address = new Address().fromJSON(json.address)
        if (json.isAuthorized !== undefined) this._isAuthorized = json.isAuthorized

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                address: StrUtils.hasSubValues(this.address) ? this.address?.toJSON() : undefined,
                isAuthorized: this.isAuthorized
            }
        }
    }
}
