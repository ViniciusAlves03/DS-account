import { Entity } from './entity'
import { IJSONSerializable } from '../utils/json.serializable.interface'
import { IJSONDeserializable } from '../utils/json.deserializable.interface'
import { JsonUtils } from '../utils/json.utils'


export class Image extends Entity implements IJSONSerializable, IJSONDeserializable<Image> {
    private _content_type?: string
    private _filename?: string
    private _size?: string
    private _data?: Buffer
    private _download_link?: string
    private _user_id?: string
    private _file_id?: string

    constructor() {
        super()
    }

    get content_type(): string | undefined {
        return this._content_type
    }

    set content_type(value: string | undefined) {
        this._content_type = value
    }

    get filename(): string | undefined {
        return this._filename
    }

    set filename(value: string | undefined) {
        this._filename = value
    }

    get size(): string | undefined {
        return this._size
    }

    set size(value: string | undefined) {
        this._size = value
    }

    get data(): Buffer | undefined {
        return this._data
    }

    set data(value: Buffer | undefined) {
        this._data = value
    }

    get download_link(): string | undefined {
        return this._download_link
    }

    set download_link(value: string | undefined) {
        this._download_link = value
    }

    get user_id(): string | undefined {
        return this._user_id
    }

    set user_id(value: string | undefined) {
        this._user_id = value
    }

    get file_id(): string | undefined {
        return this._file_id
    }

    set file_id(value: string | undefined) {
        this._file_id = value
    }

    public fromJSON(json: any): Image {
        if (!json) return this
        if (typeof json === 'string') {
            if (!JsonUtils.isJsonString(json)) {
                super.id = json
                return this
            } else {
                json = JSON.parse(json)
            }
        }

        if (json.id !== undefined) super.id = json.id
        if (json.content_type !== undefined) this.content_type = json.content_type
        if (json.filename !== undefined) this.filename = json.filename
        if (json.size !== undefined) this.size = json.size
        if (json.data !== undefined) this.data = json.data
        if (json.download_link !== undefined) this.download_link = json.download_link
        if (json.user_id !== undefined) this.user_id = json.user_id
        if (json.file_id !== undefined) this.file_id = json.file_id

        return this
    }

    public toJSON(): any {
        return {
            id: super.id,
            content_type: this.content_type,
            filename: this.filename,
            size: this.size,
            data: this.data,
            download_link: this.download_link,
            user_id: this.user_id,
            file_id: this.file_id
        }
    }
}

export enum ImageFormats {
    JPG = 'image/jpg',
    JPEG = 'image/jpeg',
    PNG = 'image/png'
}
