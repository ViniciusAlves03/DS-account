import Mongoose from 'mongoose'


interface IImageModel extends Mongoose.Document {
}

const schema: any = {
    content_type: String,
    filename: String,
    size: String,
    download_link: String,
    user_id: String,
    file_id: String
}

const options: any = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
}

export const ImageRepoModel = Mongoose.model<IImageModel>('Image', new Mongoose.Schema(schema, options))
