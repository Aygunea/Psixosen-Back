import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Message from './models/message.model.js';

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});

// Kullanıcılar için soket ID'lerini tutan bir nesne
const userIdsMap = {};
// Dinleyiciler için soket ID'lerini tutan bir nesne
const listenerIdsMap = {};

export const getSocketId = (userId) => {
    return userIdsMap[userId] || listenerIdsMap[userId];
};

// io.on("connection", (socket) => {
//     console.log('Connecting to ', socket.id);

//     const userId = socket.handshake.query.userId;
//     const userType = socket.handshake.query.userType;
//     // console.log(userType + " userType");
//     console.log(userId + " userId");

// //     // Mevcut bağlantıyı kapat
// //     if (userType === 'user' && userIdsMap[userId]) {
// //         io.to(userIdsMap[userId]).emit('forceDisconnect');
// //         io.to(userIdsMap[userId]).disconnectSockets(true);
// //     } else if (userType === 'listener' && listenerIdsMap[userId]) {
// //         io.to(listenerIdsMap[userId]).emit('forceDisconnect');
// //         io.to(listenerIdsMap[userId]).disconnectSockets(true);
// //     }

//     // Yeni bağlantıyı ekle
//     if (userType === 'user') {
//         userIdsMap[userId] = socket.id;
//         io.emit("getOnlineUsers", Object.keys(userIdsMap));
//     } else if (userType === 'listener') {
//         listenerIdsMap[userId] = socket.id;
//         io.emit("getOnlineListeners", Object.keys(listenerIdsMap));
//     }

// //     // Mark as read event
// //     socket.on('markAsRead', (messageId) => {
// //         // Mesajı güncelle
// //         Message.findByIdAndUpdate(messageId, { read: true }, { new: true })
// //             .then(updatedMessage => {
// //                 // Okundu mesajını tüm katılımcılara gönder
// //                 io.emit('messageRead', updatedMessage);
// //             })
// //             .catch(error => {
// //                 console.error('Error updating message:', error);
// //             });
// //     });

//     // Disconnect socket
//     socket.on("disconnect", () => {
//         console.log('user disconnected:', socket.id);
//         // Kullanıcı türüne göre ilgili nesneden sil
//         if (userIdsMap[userId]) {
//             delete userIdsMap[userId];
//             io.emit("getOnlineUsers", Object.keys(userIdsMap));
//         } else if (listenerIdsMap[userId]) {
//             delete listenerIdsMap[userId];
//             io.emit("getOnlineListeners", Object.keys(listenerIdsMap));
//         }
//     });
// });

io.on("connection", (socket) => {
    console.log('Connecting to ', socket.id);

    const userId = socket.handshake.query.userId;
    const userType = socket.handshake.query.userType;

    if (userType === 'user') {
        userIdsMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userIdsMap));
    } else if (userType === 'listener') {
        listenerIdsMap[userId] = socket.id;
        io.emit("getOnlineListeners", Object.keys(listenerIdsMap));
    }
    // Mark as read event
    // socket.on('markAsRead', (messageId) => {
    //     // Mesajı güncelle
    //     Message.findByIdAndUpdate(messageId, { read: true }, { new: true })
    //         .then(updatedMessage => {
    //             // Okundu mesajını tüm katılımcılara gönder
    //             io.emit('messageRead', updatedMessage);
    //         })
    //         .catch(error => {
    //             console.error('Error updating message:', error);
    //         });
    // });
    socket.on("disconnect", () => {
        console.log('user disconnected:', socket.id);
        if (userIdsMap[userId]) {
            delete userIdsMap[userId];
            io.emit("getOnlineUsers", Object.keys(userIdsMap));
        } else if (listenerIdsMap[userId]) {
            delete listenerIdsMap[userId];
            io.emit("getOnlineListeners", Object.keys(listenerIdsMap));
        }
    });
});
