import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'senderModel'
        },
        model: {
            type: String,
            required: true,
            enum: ['User', 'Listener']
        }
    },
    receiver: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'receiverModel'
        },
        model: {
            type: String,
            required: true,
            enum: ['User', 'Listener', 'Group'] 
        }
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
