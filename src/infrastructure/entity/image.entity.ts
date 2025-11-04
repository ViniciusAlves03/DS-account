import { Entity } from './entity'


export class ImageEntity extends Entity {
    public content_type?: string
    public filename?: string
    public size?: string
    public download_link?: string
    public user_id?: string
    public file_id?: string
}
