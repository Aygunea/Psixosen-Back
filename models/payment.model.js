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
    paymentDate: { 
        type: Date,
        default: Date.now
    },
    paymentStatus: { 
        type: String,
        enum: ['success', 'failure', 'refund'],
        default: 'success'
    },
    paymentReference: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
