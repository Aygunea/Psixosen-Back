import express from 'express';
import { addSuggestion, getUserSuggestions, getAllSuggestions } from '../controllers/suggestion.controllers.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router()
router.use(protectRoutes)
router.get('/', getAllSuggestions)
router.get('/specific', getUserSuggestions)
router.post('/', addSuggestion)


export default router
