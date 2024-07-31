import express from 'express';
import { getMessage, sendMessage, getAllMessages, readMark } from '../controllers/messages.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getAllMessages)
router.get('/:receiverId', getMessage)
router.post('/:receiverId', sendMessage)
router.patch('/messages/read', readMark)


export default router
