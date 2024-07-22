import express from 'express';
import { addComplaint, getComplaintList } from '../controllers/complaint.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getComplaintList)
router.post('/', addComplaint)


export default router
