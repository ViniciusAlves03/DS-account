import { IQuery } from './query.interface'


export interface IRepository<T> {
    create(item: T): Promise<T | undefined>

    find(query: IQuery): Promise<Array<T>>

    findOne(query: IQuery): Promise<T | undefined>

    update(item: T): Promise<T | undefined>

    delete(id: string): Promise<boolean>

    count(query?: IQuery): Promise<number>
}
