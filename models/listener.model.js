import mongoose from "mongoose";

const ListenerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    gender: {
        type: String,
        required: true,
    },
    birth: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    education: {
        type: String,
        required: true,
    },
    diploma: {
        type: String,
        required: true,
    },
    fieldOfActivity: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    languages: {
        type: String,
        required: true,
    },
    additions: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
    },
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    suggests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Suggest'
    }],
    complaints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
    }],
    balance: {
        type: Number,
        default: 0
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    notfications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemNotification'
    }]
}, { timestamps: true })

export default mongoose.model("Listener", ListenerSchema)
