import { IRepository } from './repository.interface'
import { Admin } from '../domain/model/admin'


export interface IAdminRepository extends IRepository<Admin> {
}
