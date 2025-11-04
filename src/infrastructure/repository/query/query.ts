import { IPagination, IQuery } from '../../../application/port/query.interface'
import { Pagination } from './pagination'


export class Query implements IQuery {
    private _fields!: Array<string>
    private _ordination!: Map<string, string>
    private _pagination!: IPagination
    private _filters!: object

    constructor(fields?: Array<string>, ordination?: Map<string, string>,
                pagination?: IPagination, filters?: object) {
        this.fields = fields ? fields : []
        this.ordination = ordination ? ordination : new Map()
        this.pagination = pagination ? pagination : new Pagination()
        this.filters = filters ? filters : {}
    }

    get fields(): Array<string> {
        return this._fields
    }

    set fields(value: Array<string>) {
        this._fields = value
    }

    get ordination(): Map<string, string> {
        return this._ordination
    }

    set ordination(value: Map<string, string>) {
        this._ordination = value
    }

    get pagination(): IPagination {
        return this._pagination
    }

    set pagination(value: IPagination) {
        this._pagination = value
    }

    get filters(): object {
        return this._filters
    }

    set filters(value: object) {
        this._filters = value
    }

    public addOrdination(field: string, order: string): void {
        if (!this.ordination) this.ordination = new Map()
        this.ordination.set(field, order)
    }

    public addFilter(filter: object): void {
        this.filters = {
            ...this.filters,
            ...filter
        }
    }

    public fromJSON(json: any): Query {
        if (!json) return this

        if (json.fields) {
            this.fields = Object.keys(json.fields).map((elem) => elem, [])
        }

        if (json.sort || json.ordination) {
            const __ordination: Map<string, string> = new Map()
            Object.keys((json.sort || json.ordination))
                .reduce((prev, elem) => __ordination.set(elem, (json.sort ? json.sort[elem] : json.ordination[elem])), {})
            this.ordination = __ordination
        }

        if (json.pagination) this.pagination = new Pagination().fromJSON(json.pagination)
        if (json.filters) this.filters = json.filters

        return this
    }

    public toJSON(): any {
        return {
            fields: this.fields ? [...this.fields].reduce((obj, value, key) => (obj[value] = 1, obj), {}) : [],
            ordination: this.ordination.size > 0 ?
                [...this.ordination.entries()]
                    .reduce((obj, [key, value]) => (obj[key] = value, obj), {}) : { created_at: -1 },
            pagination: this.pagination.toJSON(),
            filters: this.filters
        }
    }
}
