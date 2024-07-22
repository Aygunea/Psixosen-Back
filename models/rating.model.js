import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    }, 
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

export default mongoose.model('Rating', ratingSchema);
