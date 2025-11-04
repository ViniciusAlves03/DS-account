import { injectable } from 'inversify'
import { Dependent } from "../../../application/domain/model/dependent"
import { DependentEntity } from '../dependent.entity'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { Address } from '../../../application/domain/model/address'


@injectable()
export class DependentEntityMapper implements IEntityMapper<Dependent, DependentEntity> {
    public transform(item: any): any {
        if (item instanceof Dependent) return this.modelToModelEntity(item)
        return this.jsonToModel(item)
    }

    public modelToModelEntity(item: Dependent): DependentEntity {
        const result: DependentEntity = new DependentEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.type !== undefined) result.type = item.type
        if (item.name !== undefined) result.name = item.name
        if (item.gender !== undefined) result.gender = item.gender
        if (item.email !== undefined) result.email = item.email
        if (item.password !== undefined) result.password = item.password
        if (item.change_password !== undefined) result.change_password = item.change_password
        if (item.check_email !== undefined) result.check_email = item.check_email
        if (item.last_login !== undefined) result.last_login = item.last_login
        if (item.birth_date !== undefined) result.birth_date = item.birth_date
        if (item.phone_number !== undefined) result.phone_number = item.phone_number
        if (item.language !== undefined) result.language = item.language
        if (item.reset_password_token !== undefined) result.reset_password_token = item.reset_password_token
        if (item.protected !== undefined) result.protected = item.protected
        if (item.address !== undefined) result.address = item.address.toJSON()
        if (item.isAuthorized !== undefined) result.address = item.isAuthorized

        return result
    }

    public jsonToModel(json: any): Dependent {
        const result: Dependent = new Dependent()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        else result.id = json._id
        if (json.created_at !== undefined) result.created_at = json.created_at
        if (json.updated_at !== undefined) result.updated_at = json.updated_at
        if (json.type !== undefined) result.type = json.type
        if (json.name !== undefined) result.name = json.name
        if (json.gender !== undefined) result.gender = json.gender
        if (json.email !== undefined) result.email = json.email
        if (json.password !== undefined) result.password = json.password
        if (json.change_password !== undefined) result.change_password = json.change_password
        if (json.check_email !== undefined) result.check_email = json.check_email
        if (json.last_login !== undefined) result.last_login = json.last_login
        if (json.birth_date !== undefined) result.birth_date = json.birth_date
        if (json.phone_number !== undefined) result.phone_number = json.phone_number
        if (json.language !== undefined) result.language = json.language
        if (json.reset_password_token !== undefined) result.reset_password_token = json.reset_password_token
        if (json.protected !== undefined) result.protected = json.protected
        if (json.address !== undefined) result.address = new Address().fromJSON(json.address)
        if (json.isAuthorized !== undefined) result.isAuthorized = json.isAuthorized

        return result
    }
}
