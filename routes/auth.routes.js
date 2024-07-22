import express from 'express'
import { signup, signin, logout, resetPassword, verifyPassword } from '../controllers/auth.controllers.js'
import multer from 'multer';

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/diplomas/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const router = express.Router()
// router.post("/signup",uploadDiploma, signup)
router.post("/signup", upload.single('diploma'), signup);
router.post("/signin", signin)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)
router.post("/verify-password", verifyPassword)


export default router;
