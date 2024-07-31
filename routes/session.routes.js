import express from 'express';
import {
    createPoolRequest,
    acceptSessionRequest,
    createSpecificRequest,
    getRequests,
    getCompletedSessions,
    // availableslots
} from '../controllers/session.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js'; 

const router = express.Router();
router.use(protectRoutes)
router.post('/poolrequest', createPoolRequest);
router.post('/accept-request', acceptSessionRequest);
router.post('/suggest/:listenerId', createSpecificRequest);

router.get('/', getRequests);
router.get('/completed-sessions', getCompletedSessions);
// router.get('/available-slots/:listenerId',availableslots)

export default router;
