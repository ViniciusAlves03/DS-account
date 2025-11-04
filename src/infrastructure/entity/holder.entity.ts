import { UserEntity } from "./user.entity";


export class HolderEntity extends UserEntity {
    public address?: any
    public dependents?: Array<any>
}
