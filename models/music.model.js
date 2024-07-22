import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    coverImage:{
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true
    },
    watchCount:{
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('Music', musicSchema);
