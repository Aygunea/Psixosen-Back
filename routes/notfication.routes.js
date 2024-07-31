import express from 'express';
import { createNotification, getNotifications,createAdminNotification } from '../controllers/notfication.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.post('/', createNotification)
router.post('/adminnotification', createAdminNotification)

router.get('/', protectRoutes, getNotifications)



export default router
