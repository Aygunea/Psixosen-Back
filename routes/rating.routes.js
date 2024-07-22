import express from 'express';
import { getSpecificListenerRatings, addRating } from '../controllers/rating.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/:listenerId', getSpecificListenerRatings)
router.post('/', addRating)


export default router