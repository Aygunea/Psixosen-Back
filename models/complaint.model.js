import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    complainantId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'complainantType',
        required: true,
        index: true
    },
    complainantType: {
        type: String,
        required: true,
        enum: ['User', 'Listener']
    },
    complainedAboutId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'complainedAboutType',
        required: true,
        index: true
    },
    complainedAboutType: {
        type: String,
        required: true,
        enum: ['User', 'Listener']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
