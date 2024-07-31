import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    listenerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listener',
        index: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
    },
    price: {
        type: Number, // Price of the session
        required: true
    },
    sessionStartTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // Duration in minutes
        required: true
    },
    endTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted','timedout', 'completed', 'cancelled'],
        default: 'pending'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    ratingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating',
    }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
