import express from 'express';
const router = express.Router();

// Define admin routes here
router.get('/dashboard', (req, res) => {
    res.send('Admin Dashboard');
});

router.get('/users', (req, res) => {
    // Logic to manage users
});

export default router;
