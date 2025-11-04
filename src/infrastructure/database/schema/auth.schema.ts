import Mongoose from 'mongoose'


interface IAuthModel extends Mongoose.Document {
}

const schema: any = {
    access_token: String,
    refresh_token: {
        hash: String,
        issued_at: Number,
        expiration: Number
    },
    user_id: String
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

export const AuthRepoModel = Mongoose.model<IAuthModel>('Auth', new Mongoose.Schema(schema, options))
