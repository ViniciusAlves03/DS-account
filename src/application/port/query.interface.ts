import { IJSONSerializable } from '../domain/utils/json.serializable.interface'
import { IJSONDeserializable } from '../domain/utils/json.deserializable.interface'


export interface IQuery extends IJSONSerializable, IJSONDeserializable<IQuery> {
    fields: Array<string>
    ordination: Map<string, string>
    pagination: IPagination
    filters: object

    addOrdination(field: string, order: string): void

    addFilter(filter: object): void
}

export interface IPagination extends IJSONSerializable, IJSONDeserializable<IPagination> {
    page: number
    limit: number
}
