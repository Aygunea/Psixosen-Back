import SystemNotification from "../models/notfication.model.js";
import User from "../models/User.model.js";
import Listener from "../models/listener.model.js";

export const createNotification = async (notificationData) => {
    const { title, message, type, recipient } = notificationData;
    const { id, model, sendToAllUsers, sendToAllListeners, sendToAll } = recipient;
    
    if (!title || !message || !id ) {
        throw new Error("Please fill all required fields");
    }

    try {
        const sendNotification = async (recipientId, recipientModel) => {
            const newNotification = await SystemNotification.create({
                title,
                message,
                type,
                recipient: {
                    id: recipientId,
                    model: recipientModel.charAt(0).toUpperCase() + recipientModel.slice(1).toLowerCase()
                }
            });

            if (recipientModel.toLowerCase() === 'user') {
                await User.findByIdAndUpdate(recipientId, { $push: { notifications: newNotification._id } });
            } else if (recipientModel.toLowerCase() === 'listener') {
                await Listener.findByIdAndUpdate(recipientId, { $push: { notifications: newNotification._id } });
            }

            return newNotification;
        };

        let notifications = [];
        if (sendToAllUsers) {
            const users = await User.find();
            notifications = await Promise.all(users.map(user => sendNotification(user._id, 'User')));
        } else if (sendToAllListeners) {
            const listeners = await Listener.find();
            notifications = await Promise.all(listeners.map(listener => sendNotification(listener._id, 'Listener')));
        } else if (sendToAll) {
            const users = await User.find();
            const listeners = await Listener.find();
            notifications = await Promise.all([
                ...users.map(user => sendNotification(user._id, 'User')),
                ...listeners.map(listener => sendNotification(listener._id, 'Listener'))
            ]);
        } else {
            const newNotification = await sendNotification(id, model);
            notifications.push(newNotification);
        }
        console.log(notifications);
        return notifications;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Something went wrong");
    }
};
export const createAdminNotification = async (req, res) => {
    const { title, message, type, recipient } = req.body;
    const { id, model, sendToAllUsers, sendToAllListeners, sendToAll } = recipient;

    if (!title || !message || (!id && !sendToAllUsers && !sendToAllListeners && !sendToAll)) {
        return res.status(400).send({ error: "Please fill all required fields" });
    }

    try {
        const sendNotification = async (recipientId, recipientModel) => {
            const newNotification = await SystemNotification.create({
                title,
                message,
                type,
                recipient: {
                    id: recipientId,
                    model: recipientModel.charAt(0).toUpperCase() + recipientModel.slice(1).toLowerCase()
                }
            });

            if (recipientModel.toLowerCase() === 'user') {
                await User.findByIdAndUpdate(recipientId, { $push: { notifications: newNotification._id } });
            } else if (recipientModel.toLowerCase() === 'listener') {
                await Listener.findByIdAndUpdate(recipientId, { $push: { notifications: newNotification._id } });
            }

            return newNotification;
        };

        let notifications = [];
        if (sendToAllUsers) {
            const users = await User.find();
            notifications = await Promise.all(users.map(user => sendNotification(user._id, 'User')));
        } else if (sendToAllListeners) {
            const listeners = await Listener.find();
            notifications = await Promise.all(listeners.map(listener => sendNotification(listener._id, 'Listener')));
        } else if (sendToAll) {
            const users = await User.find();
            const listeners = await Listener.find();
            notifications = await Promise.all([
                ...users.map(user => sendNotification(user._id, 'User')),
                ...listeners.map(listener => sendNotification(listener._id, 'Listener'))
            ]);
        } else {
            const newNotification = await sendNotification(id, model);
            notifications.push(newNotification);
        }
        console.log(notifications);
        return res.status(200).send(notifications);
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).send({ error: "Something went wrong" });
    }
};

export const getNotifications = async (request, response) => {
    const { _id: userId, role } = request.user;
    const model = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    console.log(model + " model");
    console.log(userId + " userId");

    try {
        const notifications = await SystemNotification.find({
            "recipient.id": userId,
            "recipient.model": model
        }).sort({ createdAt: -1 });

        response.status(200).send(notifications);
    } catch (error) {
        response.status(400).send({ error: error.message });
    }
};
