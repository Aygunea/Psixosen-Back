import express from 'express';
import { getAllListeners, getSpecificListener, updateListener } from '../controllers/listener.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getAllListeners)
router.get('/:listenerId', getSpecificListener)
router.patch('/',updateListener);


export default router