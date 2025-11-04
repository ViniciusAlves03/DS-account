import { UserEntity } from "./user.entity";


export class DependentEntity extends UserEntity {
    public address?: any
    public isAuthorized?: string
}
