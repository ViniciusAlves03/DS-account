import { IRepository } from './repository.interface'
import { Holder } from '../domain/model/holder'
import { ValidationException } from 'application/domain/exception/validation.exception'


export interface IHolderRepository extends IRepository<Holder> {
    findOneById(_id: string): Promise<Holder | undefined>

    checkExists(users: Holder | Array<Holder>): Promise<boolean | ValidationException>

    associateDependent(holderId: string, dependentId: string): Promise<boolean | undefined>

    checkDependentIsAssociated(holderId: string, dependentId: string): Promise<boolean>

    updateAuthorizationDependent(dependentId: string, isAuthorized: boolean): Promise<boolean>

    removeAssociationDependentById(holderId: string, dependentId: string): Promise<Holder | undefined>

    removeDependentById(dependentId: string): Promise<boolean | undefined>
}
