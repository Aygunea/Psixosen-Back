import express from 'express';
import { addMusic, getMusicList } from '../controllers/music.controllers.js';
import uploadMultiple from '../config/multerConfig.js';

const router = express.Router();

router.post('/',uploadMultiple, addMusic);
router.get('/', getMusicList);

export default router;
