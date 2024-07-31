// paymentController.js
import Payment from '../models/Payment';
import User from '../models/User.model.js';

export const processPayment = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const newPayment = await Payment.create({
            payer: userId,
            amount,
            paymentStatus: 'pending'
        });

        // Ödəniş müvəffəqiyyətli olarsa
        newPayment.paymentStatus = 'success';
        await newPayment.save();

        // İstifadəçinin balansını artırmaq
        const user = await User.findById(userId);
        user.balance += amount;
        await user.save();

        res.status(200).send({ success: true, message: 'Payment successful', balance: user.balance });
    } catch (error) {
        res.status(500).send({ success: false, message: 'Payment failed', error });
    }
};
