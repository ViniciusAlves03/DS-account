import { IService } from './service.interface'
import { Dependent } from 'application/domain/model/dependent'


export interface IDependentService extends IService<Dependent> {
    addDependent(item: Dependent, holderid: string): Promise<Dependent | undefined>

    updateAuthorization(dependentId: string, isAuthorized: boolean): Promise<Dependent | undefined>
}
