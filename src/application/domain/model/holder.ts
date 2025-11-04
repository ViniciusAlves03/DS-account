import { IJSONDeserializable } from "../utils/json.deserializable.interface";
import { IJSONSerializable } from "../utils/json.serializable.interface";
import { JsonUtils } from "../utils/json.utils";
import { StrUtils } from "../utils/str.utils";
import { UserType } from "../utils/user.type";
import { UsersScopes } from "../utils/users.scopes";
import { Address } from "./address";
import { Dependent } from "./dependent";
import { User } from "./user";


export class Holder extends User implements IJSONSerializable, IJSONDeserializable<Holder> {
    private _address?: Address
    private _dependents?: Array<Dependent>

    constructor() {
        super()
        super.type = UserType.HOLDER
        super.scopes = UsersScopes.HOLDER
    }

    get address(): Address | undefined {
        return this._address
    }

    set address(value: Address | undefined) {
        this._address = value
    }

    get dependents(): Array<Dependent> | undefined {
        return this._dependents
    }

    set dependents(value: Array<Dependent> | undefined) {
        this._dependents = value
    }

    get total_dependents(): number {
        return this._dependents ? this._dependents.length : 0
    }

    public fromJSON(json: any): Holder {
        if (!json) return this
        super.fromJSON(json)

        if (typeof json === 'string' && JsonUtils.isJsonString(json)) {
            json = JSON.parse(json)
        }

        if (json.address !== undefined) this._address = new Address().fromJSON(json.address)

        return this
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            ...{
                address: StrUtils.hasSubValues(this.address) ? this.address?.toJSON() : undefined,
                dependents: this.dependents?.length ? this.dependents.map(item => {
                    item.type = undefined
                    return item.toJSON()
                }) : [],
                total_dependents: this.total_dependents ? this.total_dependents : 0,
            }
        }
    }
}
