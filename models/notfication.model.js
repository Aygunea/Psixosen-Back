import mongoose from "mongoose";

const systemNotificationSchema = new mongoose.Schema({
    recipient: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'recipient.model'
        },
        model: {
            type: String,
            required: true,
            enum: ['User', 'Listener']
        }
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning'] 
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('SystemNotification', systemNotificationSchema);
