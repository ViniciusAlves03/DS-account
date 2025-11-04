import Mongoose from 'mongoose'


interface IIntegrationEventModel extends Mongoose.Document {
}

const integrationEventSchema = new Mongoose.Schema({
    __operation: {
        type: String,
        default: 'publish',
        required: true
    },
    __routing_key: {
        type: String,
        required: true
    }
},
    {
        strict: false,
        timestamps: { createdAt: 'created_at', updatedAt: false },
        toJSON: {
            transform: (doc, ret) => {
                const { _id, __v, ...rest } = ret;

                const newRet = { id: _id, ...rest };

                return newRet;
            }
        }
    }
)

export const IntegrationEventRepoModel = Mongoose.model<IIntegrationEventModel>(
    'IntegrationEvent', integrationEventSchema
)
