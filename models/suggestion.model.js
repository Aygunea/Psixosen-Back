import mongoose from "mongoose";

const suggestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        enum: ['User', 'Listener'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('Suggest', suggestSchema);
