import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});
const userIdsMap = {};
const listenerIdsMap = {};

export const getSocketId = (userId) => {
    return userIdsMap[userId] || listenerIdsMap[userId];
};
io.on("connection", (socket) => {
    console.log('Connecting to ', socket.id);

    const userId = socket.handshake.query.userId;
    const userType = socket.handshake.query.userType;

    if (userType === 'user') {
        userIdsMap[userId] = socket.id;
    } else if (userType === 'listener') {
        listenerIdsMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userIdsMap));
    io.emit("getOnlineListeners", Object.keys(listenerIdsMap));

    socket.on("disconnect", () => {
        console.log('User disconnected:', socket.id);
        if (userIdsMap[userId]) {
            delete userIdsMap[userId];
            io.emit("getOnlineUsers", Object.keys(userIdsMap));
        }
        if (listenerIdsMap[userId]) {
            delete listenerIdsMap[userId];
            io.emit("getOnlineListeners", Object.keys(listenerIdsMap));
        }
    });
});


