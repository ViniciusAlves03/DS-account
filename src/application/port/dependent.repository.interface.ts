import { IRepository } from './repository.interface'
import { Dependent } from '../domain/model/dependent'
import { ValidationException } from 'application/domain/exception/validation.exception'


export interface IDependentRepository extends IRepository<Dependent> {
    findOneById(_id: string): Promise<Dependent | undefined>

    checkExists(users: Dependent | Array<Dependent>): Promise<boolean | ValidationException>

    updateAuthorization(dependentId: string, isAuthorized: boolean): Promise<Dependent | undefined>
}
