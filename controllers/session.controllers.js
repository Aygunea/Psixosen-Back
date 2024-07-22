import Session from '../models/session.model.js';
import { io, getSocketId } from '../socket.js'; // io ve getSocketId'yi içe aktar
import Listener from '../models/listener.model.js';
import User from '../models/User.model.js';
import { createNotification } from './notfication.controllers.js'; // Bildiriş yaratma funksiyasını import edin

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

export const createPoolRequest = async (req, res) => {

    try {
        const { topic, duration, details, price, } = req.body;
        const { _id: userId } = req.user

        if (!userId || !topic || !duration || !price) {
            return res.status(400).send({ error: 'Invalid request' });
        }

        const newRequest = await Session.create({ userId, topic, duration, details, price, });
        await User.findByIdAndUpdate(userId, { $push: { sessions: newRequest._id } });

        // İstek havuzunu dinleyen dinleyicilere bildir
        io.emit('new-request', newRequest);

        res.status(201).send(newRequest);
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
};
export const createSpecificMomentaryRequest = async (req, res) => {
    try {
        const { listenerId } = req.params;
        const { _id: userId } = req.user;
        const { topic, duration, details, price } = req.body;

        if (!userId || !topic || !duration || !price) {
            return res.status(400).send({ error: 'Invalid request' });
        }
        // Create the session request
        const newRequest = await Session.create({
            userId,
            listenerId,
            topic,
            duration,
            details,
            price,
        });

        // Update user with the new session
        await User.findByIdAndUpdate(userId, { $push: { sessions: newRequest._id } });

        // Notify the listener if online
        // const listenerSocketId = getSocketId(listenerId);
        // if (listenerSocketId) {
        //     io.to(listenerSocketId).emit('new-request', newRequest);
        // }

        res.status(201).send(newRequest);
    } catch (error) {
        console.error('Error creating specific pool request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
export const createSpecificRequest = async (req, res) => {
    try {
        const { listenerId } = req.params;
        const { _id: userId } = req.user;

        const { topic, duration, details, price, sessionStartTime } = req.body;
        if (!userId || !topic || !duration || !price || !sessionStartTime) {
            return res.status(400).send({ error: 'Invalid request' });
        }

        const newRequest = await Session.create({ userId, listenerId, topic, sessionStartTime, duration, details, price });

        await User.findByIdAndUpdate(userId, { $push: { sessions: newRequest._id } });
        await Listener.findByIdAndUpdate(listenerId, { $push: { sessions: newRequest._id } });

        const userName = await getUserName(userId);
        const timeString = new Date(sessionStartTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateString = new Date(sessionStartTime).toLocaleDateString('az-AZ');

        const notificationMessage = `${userName} adlı danışan ${timeString} | ${dateString} tarixinə seans təklif edir.`;

        // Bildirişi yarat
        await createNotification({
            body: {
                title: 'Yeni Seans Təklifi',
                message: notificationMessage,
                type: 'info',
                recipient: {
                    id: listenerId,
                    model: 'Listener'
                }
            }
        });

        res.status(201).send(newRequest);
    } catch (error) {
        console.error('Error creating specific request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};


export const acceptSessionRequest = async (req, res) => {
    try {
        const { _id: requestId } = req.body;
        const { _id: listenerId } = req.user;

        const request = await Session.findById(requestId);
        if (!request) {
            return res.status(404).send('Request not found');
        }

        if (request.status !== 'pending') {
            return res.status(400).send('Request already accepted or invalid status');
        }

        // Check if the request is a pool request or specific request
        if (!request.listenerId) {
            // Pool request
            request.listenerId = listenerId;
            request.sessionStartTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes later
        }
        request.status = 'accepted';
        request.endTime = new Date(request.sessionStartTime.getTime() + request.duration * 60000); // Calculate end time
        await request.save();

        await Listener.findByIdAndUpdate(listenerId, { $push: { sessions: request._id } });

        // Notify other listeners that the request is accepted and removed
        io.emit('request-removed', requestId);

        // Notify the client
        const clientSocketId = getSocketId(request.userId.toString());
        if (clientSocketId) {
            io.to(clientSocketId).emit('request-accepted', request);
        }
        // Bildiriş yaratma
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
        const notificationMessageListener = `${userName}  adlı dinləyicinin təklifini qəbul etdiniz. Seans ${timeString} | ${dateString} tarixində baş tutacaqdır.`;

        await createNotification({
            body: {
                title: 'Yeni Seans',
                message: notificationMessageUser,
                type: 'info',
                recipient: {
                    id: request.userId,
                    model: 'User'
                }
            }
        }, res);

        await createNotification({
            body: {
                title: 'Yeni Seans',
                message: notificationMessageListener,
                type: 'info',
                recipient: {
                    id: listenerId,
                    model: 'Listener'
                }
            }
        }, res);
        // Schedule session completion
        setTimeout(async () => {
            request.status = 'completed';
            await request.save();
            console.log(`Session ${request._id} completed`);

            // Notify the client and listener that the session is complete
            // if (clientSocketId) {
            //     io.to(clientSocketId).emit('session-completed', request);
            // }
            // const listenerSocketId = getSocketId(request.listenerId.toString());
            // if (listenerSocketId) {
            //     io.to(listenerSocketId).emit('session-completed', request);
            // }

        }, request.duration * 60 * 1000); // Convert duration from minutes to milliseconds

        res.status(200).send(request);
    } catch (error) {
        console.error('Error accepting session request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// anliq spesifik muraciet qebulu
export const acceptSpecificMomentaryRequest = async (req, res) => {
    try {
        const { _id: requestId } = req.body;
        const { _id: listenerId } = req.user;

        const request = await Session.findById(requestId);
        if (!request) {
            return res.status(404).send('Request not found');
        }

        if (request.status !== 'pending') {
            return res.status(400).send('Request already accepted or invalid status');
        }

        if (!request.listenerId || request.listenerId.toString() !== listenerId.toString()) {
            return res.status(403).send('You are not authorized to accept this request');
        }

        // Set session start time and update status
        request.sessionStartTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes later
        request.status = 'accepted';
        request.endTime = new Date(request.sessionStartTime.getTime() + request.duration * 60000); // Calculate end time
        await request.save();

        // Notify the client
        const clientSocketId = getSocketId(request.userId.toString());
        if (clientSocketId) {
            io.to(clientSocketId).emit('request-accepted', request);
        }

        // Schedule session completion
        setTimeout(async () => {
            request.status = 'completed';
            await request.save();
            console.log(`Session ${request._id} completed`);

            // Notify the client and listener that the session is complete
            // if (clientSocketId) {
            //     io.to(clientSocketId).emit('session-completed', request);
            // }
            // const listenerSocketId = getSocketId(request.listenerId.toString());
            // if (listenerSocketId) {
            //     io.to(listenerSocketId).emit('session-completed', request);
            // }

        }, request.duration * 60000); // Convert duration from minutes to milliseconds

        res.status(200).send(request);
    } catch (error) {
        console.error('Error accepting specific momentary request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

export const getAllSessions = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        // Find all sessions where the user is either the listener or the session creator
        const allSessions = await Session.find({ $or: [{ userId }, { listenerId: userId }] })
            .populate('userId').populate('listenerId');

        res.status(200).send(allSessions);
    } catch (error) {
        console.error('Error retrieving allSessions:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

export const getPoolRequests = async (req, res) => {
    try {
        const poolRequests = await Session.find({ listenerId: { $exists: false }, status: 'pending' })
            .populate('userId').populate('listenerId');;
        res.status(200).send(poolRequests);
    } catch (error) {
        console.error('Error retrieving pool requests:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
export const getCompletedSessions = async (req, res) => {
    try {
        const { _id: userId } = req.user;

        // Kullanıcının tamamlanmış seanslarını bul
        const completedSessions = await Session.find({
            $or: [{ userId, status: 'completed' }, { listenerId: userId, status: 'completed' }]
        })
            .populate('userId')
            .populate('listenerId');

        res.status(200).send(completedSessions);
    } catch (error) {
        console.error('Error retrieving completed sessions:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
