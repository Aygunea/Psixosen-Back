import mongoose from "mongoose";

const UserSchema =new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    gender: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
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

export default mongoose.model("User", UserSchema)
