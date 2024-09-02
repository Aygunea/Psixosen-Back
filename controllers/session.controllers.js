import Session from '../models/session.model.js';
import { io, getSocketId } from '../socket.js';
import Listener from '../models/listener.model.js';
import User from '../models/User.model.js';
import { createNotification } from './notfication.controllers.js';

// Dinləyici adını əldə etmək funksiyası
const getListenerName = async (listenerId) => {
    const listener = await Listener.findById(listenerId);
    return listener ? listener.nickname : "Unknown Listener";
};

// İstifadəçi adını əldə etmək funksiyası
const getUserName = async (userId) => {
    const user = await User.findById(userId);
    return user ? user.username : "Unknown User";
};

const updateTimedOutSessions = async () => {
    const now = new Date();
    await Session.updateMany(
        { status: 'pending', sessionStartTime: { $lt: now } },
        { $set: { status: 'timedout' } }
    );
};

export const createPoolRequest = async (req, res) => {

    try {
        const { topic, duration, details, price, } = req.body;
        const { _id: userId } = req.user
        console.log(userId);
        if (!userId || !topic || !duration || !price) {
            return res.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }

        const newRequest = await Session.create({ userId, topic, duration, details, price, });
        await User.findByIdAndUpdate(userId, { $push: { sessions: newRequest._id } });

        const populatedRequest = await Session.findById(newRequest._id)
            .populate('userId');

        // Emit the populated request to all listeners
        io.emit('pool-request', populatedRequest);

        res.status(201).send({
            message: "Sizin təklifiniz uğurla göndərildi!",
            data: populatedRequest
        });
    } catch (error) {
        res.status(500).send({ error: 'Server xətası' });
    }
};
// export const availableslots = async (req, res) => {
//     const { listenerId } = req.params;
//     try {
//         const currentDate = new Date();
//         const endDate = new Date();
//         endDate.setDate(currentDate.getDate() + 7); // Get slots for the next 7 days

//         const sessions = await Session.find({
//             listenerId: mongoose.Types.ObjectId(listenerId),
//             sessionStartTime: { $gte: currentDate },
//             endTime: { $lte: endDate }
//         });

//         res.json(sessions);
//     } catch (error) {
//         console.error('Error fetching slots:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

// const checkSessionAvailability = async (listenerId, selectedDate, duration) => {
//     const startTime = new Date(selectedDate);
//     const endTime = new Date(startTime.getTime() + duration * 60000); // Duration'ı milisaniyeye çevirin

//     try {
//         const overlappingSessions = await Session.find({
//             listenerId: mongoose.Types.ObjectId(listenerId),
//             sessionStartTime: { $lt: endTime }, // Seansın bitiş zamanı istenilen zaman diliminden önce başlamalı
//             endTime: { $gt: startTime } // Seansın bitiş zamanı istenilen zaman diliminden sonra bitmemeli
//         });

//         if (overlappingSessions.length > 0) {
//             return { success: false, message: 'Dinleyicinin bu zaman diliminde mevcut bir seansı var.' };
//         }

//         return { success: true, message: 'Dinleyici bu zaman diliminde müsait.' };
//     } catch (error) {
//         console.error('Hata:', error);
//         return { success: false, message: 'Sunucu hatası' };
//     }
// };

export const createSpecificRequest = async (req, res) => {
    const { listenerId } = req.params;
    const { _id: userId } = req.user;
    // const { selectedDate, duration } = req.body;

    // const availabilityCheck = await checkSessionAvailability(listenerId, selectedDate, duration);

    // if (!availabilityCheck.success) {
    //     return res.status(400).json({ message: availabilityCheck.message });
    // }
    try {
        const { topic, duration, details, price, sessionStartTime } = req.body;
        if (!userId || !topic || !duration || !price || !sessionStartTime) {
            return res.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }

        const newRequest = await Session.create({ userId, listenerId, topic, sessionStartTime, duration, details, price });

        await User.findByIdAndUpdate(userId, { $push: { sessions: newRequest._id } });
        await Listener.findByIdAndUpdate(listenerId, { $push: { sessions: newRequest._id } });

        const populatedRequest = await Session.findById(newRequest._id)
            .populate('userId');

        const userName = await getUserName(userId);
        const timeString = new Date(sessionStartTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = new Date(sessionStartTime).toLocaleDateString('az-AZ');

        const notificationMessage = `${userName} adlı danışan ${timeString} | ${dateString} tarixinə seans təklif edir.`;

        // Bildirişi yarat
        await createNotification({
            title: 'Yeni Seans Təklifi',
            message: notificationMessage,
            type: 'info',
            recipient: {
                id: listenerId,
                model: 'Listener'
            }
        });
        io.emit('specific-request', populatedRequest);

        res.status(201).send(populatedRequest);
    } catch (error) {
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const acceptSessionRequest = async (req, res) => {
    try {
        const { _id: requestId } = req.body;
        const { _id: listenerId } = req.user;

        const request = await Session.findById(requestId);
        if (!request) {
            return res.status(404).send({ message: 'Belə bir istək tapılmadı' });
        }
        if (request.status !== 'pending') {
            return res.status(400).send({ message: 'İstək artıq qəbul edilib' });
        }

        // Check if the request is a pool request or specific request
        if (!request.listenerId) {
            // Pool request
            request.listenerId = listenerId;
            request.sessionStartTime = new Date(Date.now() + 5 * 60 * 1000);
        }
        request.status = 'accepted';
        request.endTime = new Date(request.sessionStartTime.getTime() + request.duration * 60000); // Calculate end time
        await request.save();

        await Listener.findByIdAndUpdate(listenerId, { $push: { sessions: request._id } });

        // Notify other listeners that the request is accepted and removed
        io.emit('request-removed-from-pool', requestId);

        // // Notify the client
        const clientSocketId = getSocketId(request.userId.toString());
        if (clientSocketId) {
            io.to(clientSocketId).emit('request-accepted', request);
        }

        // Dinləyici və istifadəçi adlarını əldə etmək
        const listenerName = await getListenerName(listenerId);
        const userName = await getUserName(request.userId);

        // Saat və tarix formatını 24 saat rejimində təyin edirik
        const timeString = request.sessionStartTime.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = request.sessionStartTime.toLocaleDateString('az-AZ');

        // Bildiriş mesajlarını yaratmaq
        const notificationMessageUser = `
        Seans təklifiniz ${listenerName} adlı dinləyici tərəfindən qəbul edildi. 
        ${timeString} | ${dateString} tarixində seansınız baş tutacaqdır.`;

        const notificationMessageListener = `${userName}  adlı dinləyicinin təklifini qəbul etdiniz. 
        Seans ${timeString} | ${dateString} tarixində baş tutacaqdır.`;
        // Bildirişi yarat
        await createNotification({
            title: 'Yeni Seans',
            message: notificationMessageListener,
            type: 'info',
            recipient: {
                id: listenerId,
                model: 'Listener'
            }
        });
        await createNotification({
            title: 'Yeni Seans',
            message: notificationMessageUser,
            type: 'info',
            recipient: {
                id: request.userId,
                model: 'User'
            }
        });

        // Schedule session completion
        setTimeout(async () => {
            request.status = 'completed';
            await request.save();
            console.log(`Session ${request._id} completed`);
        }, request.duration * 60 * 1000);

        res.status(200).send(request);
    } catch (error) {
        console.error('Error accepting session request:', error);
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const getRequests = async (req, res) => {
    try {
        const { _id: userId, role } = req.user;
        const { type } = req.query;

        await updateTimedOutSessions();

        let query = {};

        if (role === 'listener') {
            // Listener istəkləri
            if (type === 'pool') {
                query = { listenerId: { $exists: false }, status: 'pending' };
            } else {
                query = {
                    listenerId: userId,
                    status: { $in: ['accepted', 'pending'] }
                };
            }
        } else {
            // User istəkləri
            query = {
                userId,
                status: { $in: ['accepted', 'pending'] }
            };
        }

        const requests = await Session.find(query)
            .populate('userId')
            .populate('listenerId')
            .sort({ createdAt: -1 });
        res.status(200).send(requests);
    } catch (error) {
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const getCompletedSessions = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        await updateTimedOutSessions();

        const completedSessions = await Session.find({
            $or: [
                { userId, status: 'completed' },
                { listenerId: userId, status: 'completed' },
                { userId, status: 'timedout' },
                { listenerId: userId, status: 'timedout' }
            ]
        })
            .populate('userId')
            .populate('listenerId')
            .sort({ createdAt: -1 });

        res.status(200).send(completedSessions);
    } catch (error) {
        res.status(500).send({ error: 'Server xətası' });
    }
};
