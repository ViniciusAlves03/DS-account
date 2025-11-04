import Mongoose from 'mongoose'

interface IUserModel extends Mongoose.Document {
}

const userSchema = new Mongoose.Schema({
    // Parameters for all users.
    id: Mongoose.Schema.Types.ObjectId,
    name: String,
    gender: String,
    birth_date: String,
    phone_number: String,
    last_login: Date,
    type: String,
    check_email: { type: Boolean, default: false },
    change_password: { type: Boolean, default: false },
    reset_password_token: String,

    // Login parameters
    email: { type: String, unique: true, sparse: true },
    password: String,

    // Admin parameters
    protected: { type: Boolean, default: false },

    // Holder and dependent parameters
    address: {
        street: String,
        number: String,
        complement: String,
        district: String,
        city: String,
        state: String,
        zip_code: String
    },

    // Holder parameters
    dependents: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Dependent parameters
    isAuthorized: { type: Boolean, default: true },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        toJSON: {
            transform: (doc, ret) => {
                const { _id, __v, ...rest } = ret;

                const newRet = { id: _id, ...rest };

                return newRet;
            }
        }
    })

userSchema.pre('save', function (_next) {
    const next = getNext(_next)
    try {
        this.id = this._id
        next()
    } catch (err) {
        next(err)
    }
})

function nextErr(err) {
    if (err) throw err
}

function getNext(next) {
    if (typeof next !== 'function') return nextErr
    return next
}

export const UserRepoModel = Mongoose.model<IUserModel>('User', userSchema)
