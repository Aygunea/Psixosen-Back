import express from 'express';
import { getAllListeners, getSpecificListener, updateListener, getSingleListener,activateListener,toggleListenerActivation } from '../controllers/listener.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getAllListeners)
router.get('/:listenerId', getSpecificListener)
router.get('/specific/:listenerId', getSingleListener)
router.patch('/', updateListener);
router.patch('/activate/:listenerId', toggleListenerActivation);

export default router
