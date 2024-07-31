import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listener',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending,success', 'failure', 'refund'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
