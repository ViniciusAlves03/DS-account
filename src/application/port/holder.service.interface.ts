import { IService } from './service.interface'
import { Holder } from 'application/domain/model/holder'


export interface IHolderService extends IService<Holder> {
    associateDependent(holderId: string, dependentId: string): Promise<boolean | undefined>

    removeAssociationWithDependent(holderId: string, dependentId: string): Promise<Holder | undefined>

    checkAssociation(holderId: string, dependentId: string): Promise<boolean | undefined>
}
