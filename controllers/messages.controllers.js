import mongoose from 'mongoose';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import Session from '../models/session.model.js';
import { getSocketId } from '../socket.js';
import { io } from '../socket.js';

export const getMessage = async (request, response) => {
    try {
        const { receiverId } = request.params;
        const senderId = request.user._id;
        const senderModel = request.user.constructor.modelName;
        const receiverModel = senderModel === 'User' ? 'Listener' : 'User';

        const conversation = await Conversation.findOne({
            participants: {
                $all: [
                    { $elemMatch: { id: senderId, model: senderModel } },
                    { $elemMatch: { id: receiverId, model: receiverModel } }
                ]
            }
        }).populate('messages').populate('lastMessage');

        if (!conversation) {
            return response.status(200).send([]);
        }

        const messages = conversation.messages;
        response.status(200).send(messages);
    } catch (error) {
        console.log(`Error fetching messages: ${error}`);
        response.status(500).send({ error: "Internal server error" });
    }
};
export const getAllMessages = async (request, response) => {
    try {
        const senderId = request.user._id;
        const senderModel = request.user.constructor.modelName;

        // İstifadəçinin iştirak etdiyi bütün söhbətləri tapırıq
        const conversations = await Conversation.find({
            participants: {
                $elemMatch: { id: senderId, model: senderModel }
            }
        }).populate('messages');

        if (!conversations || conversations.length === 0) {
            return response.status(200).send([]);
        }

        // Bütün söhbətlərdən olan mesajları birləşdiririk
        const allMessages = conversations.reduce((acc, conversation) => {
            return acc.concat(conversation.messages);
        }, []);

        response.status(200).send(allMessages);
    } catch (error) {
        console.log(`Error fetching messages: ${error}`);
        response.status(500).send({ error: "Internal server error" });
    }
};

export const sendMessage = async (request, response) => {
    try {
        const { message } = request.body;
        let { receiverId } = request.params;
        const senderId = request.user._id;
        const senderModel = request.user.constructor.modelName;

        // Determine receiver's model (if sender is User, receiver is Listener and vice versa)
        const receiverModel = senderModel === 'User' ? 'Listener' : 'User';
        receiverId = new mongoose.Types.ObjectId(receiverId);

        // Find existing or create new Conversation
        let conversation = await Conversation.findOne({
            'participants.id': {
                $all: [senderId, receiverId]
            },
            'participants.model': {
                $all: [senderModel, receiverModel]
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [
                    { id: senderId, model: senderModel },
                    { id: receiverId, model: receiverModel }
                ],
                messages: []
            })
        }

        // Create new Message
        const newMessage = await Message.create({
            sender: { id: senderId, model: senderModel },
            receiver: { id: receiverId, model: receiverModel },
            message
        });

        if (!newMessage) {
            return response.status(500).send({ error: "Could not create message" });
        }

        // Add Message to Conversation
        conversation.messages.push(newMessage._id);
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        // Find the related Session
        const session = await Session.findOne({
            $or: [
                { userId: senderId, listenerId: receiverId, status: { $in: ['pending', 'accepted'] } },
                { userId: receiverId, listenerId: senderId, status: { $in: ['pending', 'accepted'] } }
            ]
        });
        if (!session) {
            return response.status(404).send({ error: "Session not found or invalid status" });
        }
        // Add Conversation to Session if not already added
        if (session && !session.conversationId) {
            session.conversationId = conversation._id;
            await session.save();
        }

        // Emit message to receiver via Socket.io (if applicable)
        const socketId = getSocketId(receiverId);
        if (socketId) {
            io.to(socketId).emit("newMessage", newMessage);
        }

        // Respond with the updated conversation
        const updatedConversation = await Conversation.findById(conversation._id).populate('lastMessage');
        response.status(201).send(updatedConversation);
    } catch (error) {
        console.log(`Error in sendMessage: ${error}`);
        response.status(500).send({ error: "Internal server error" });
    }
};

export const readMark =  async (req, res) => {
    try {
        const { messageIds } = req.body;

        if (!messageIds || !Array.isArray(messageIds)) {
            return res.status(400).send({ message: 'Invalid message IDs' });
        }

        await Message.updateMany(
            { _id: { $in: messageIds } },
            { $set: { read: true } }
        );

        res.status(200).send({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error updating read status:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
}
