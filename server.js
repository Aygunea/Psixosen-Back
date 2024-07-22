import express from 'express'

import dotenv from 'dotenv'
import mongoose from 'mongoose'
//Routes
import authroutes from './routes/auth.routes.js'
import messageRoute from './routes/messages.routes.js'
import userRoute from './routes/users.routes.js'
import listenerRoute from './routes/listeners.routes.js'
import notficationRoute from './routes/notfication.routes.js'
import sessionRoute from './routes/session.routes.js'
import ratingRoute from './routes/rating.routes.js'
import complaintRoute from './routes/complaints.routes.js'
import suggestRoute from './routes/suggestion.routes.js'
import musicRoute from './routes/music.routes.js'
import contactRoute from './routes/contact.routes.js'

import cookieParser from 'cookie-parser';
import { app, server } from './socket.js'

app.use(express.json())
app.use(cookieParser());
dotenv.config()

const PORT = process.env.PORT
const MONGODB_URL = process.env.MONGODB_URL
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authroutes)
app.use("/api/messages", messageRoute)
app.use("/api/users", userRoute)
app.use("/api/listeners", listenerRoute)
app.use("/api/notifications", notficationRoute)
app.use("/api/sessions", sessionRoute)
app.use("/api/ratings", ratingRoute)
app.use("/api/complaints", complaintRoute)
app.use("/api/suggest", suggestRoute)
app.use('/api/music', musicRoute);
app.use('/api/contacts', contactRoute);


mongoose.connect(MONGODB_URL)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`server listening on ${PORT} and succesfully connect database`);
        })
    }).catch((error) => {
        console.log(error);
    })
