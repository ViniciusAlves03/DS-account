import { injectable } from 'inversify'
import { IEntityMapper } from '../../port/entity.mapper.interface'
import { AuthEntity } from '../auth.entity'
import { Auth } from '../../../application/domain/model/auth'
import { RefreshToken } from '../../../application/domain/model/refresh.token'


@injectable()
export class AuthEntityMapper implements IEntityMapper<Auth, AuthEntity> {
    public transform(item: any): any {
        if (item instanceof Auth) return this.modelToModelEntity(item)
        return this.jsonToModel(item)
    }

    public modelToModelEntity(item: Auth): AuthEntity {
        const result: AuthEntity = new AuthEntity()

        if (item.id !== undefined) result.id = item.id
        if (item.access_token !== undefined) result.access_token = item.access_token
        if (item.refresh_token !== undefined) result.refresh_token = item.refresh_token.toJSON()
        if (item.user_id !== undefined) result.user_id = item.user_id

        return result
    }

    public jsonToModel(json: any): Auth {
        const result: Auth = new Auth()
        if (!json) return result

        if (json.id !== undefined) result.id = json.id
        if (json.created_at !== undefined) result.created_at = json.created_at
        if (json.updated_at !== undefined) result.updated_at = json.updated_at
        if (json.access_token !== undefined) result.access_token = json.access_token
        if (json.refresh_token !== undefined) result.refresh_token = new RefreshToken().fromJSON(json.refresh_token)
        if (json.user_id !== undefined) result.user_id = json.user_id

        return result
    }
}
