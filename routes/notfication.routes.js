import express from 'express';
import { createNotification, getNotifications } from '../controllers/notfication.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.post('/', createNotification)
router.get('/', protectRoutes, getNotifications)



export default router
