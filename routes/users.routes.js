import express from 'express';
import { getAllUsers } from '../controllers/user.controllers.js';
import { getSpecificUser } from '../controllers/user.controllers.js';

import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getAllUsers)
router.get('/:userId', getSpecificUser)


export default router
