import express from 'express'
import { signup, signin, logout, resetPassword, verifyPassword, forgetPassword, resetPasswordWithMail } from '../controllers/auth.controllers.js'

const router = express.Router()
router.post("/signup", signup);
router.post("/signin", signin)
router.post("/logout", logout)
router.post("/reset-password", resetPassword)
router.post("/verify-password", verifyPassword)
router.post("/forgot-password", forgetPassword);
router.post("/reset-password-with-mail", resetPasswordWithMail);


export default router;
