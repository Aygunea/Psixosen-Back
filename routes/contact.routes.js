import express from 'express';
import { getSharedContacts } from '../controllers/contact.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getSharedContacts)

export default router
