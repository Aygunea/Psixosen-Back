import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    admin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Listener'
        },
        model: {
            type: String,
            required: true,
            enum: ['Listener']
        }
    },
    participants: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: 'participants.model'
            },
            model: {
                type: String,
                required: true,
                enum: ['User']
            }
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    maxParticipants: {
        type: Number,
        default: 10 
    }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
