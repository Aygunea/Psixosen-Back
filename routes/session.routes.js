import express from 'express';
import {
    createPoolRequest,
    acceptSessionRequest,
    getAllSessions,
    getPoolRequests,
    createSpecificRequest,
    createSpecificMomentaryRequest,
    acceptSpecificMomentaryRequest,
    getCompletedSessions
} from '../controllers/session.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js'; // If needed

const router = express.Router();
router.use(protectRoutes)
router.post('/poolrequest', createPoolRequest);
router.post('/accept-request', acceptSessionRequest);
router.post('/suggest/:listenerId', createSpecificRequest);

router.post('/momentary/:listenerId', createSpecificMomentaryRequest);
router.post('/accept-momentary', acceptSpecificMomentaryRequest);

router.get('/', getAllSessions);
router.get('/poolrequest', getPoolRequests);
router.get('/completed-sessions', getCompletedSessions);

export default router;
