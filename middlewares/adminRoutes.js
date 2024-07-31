import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import Listener from '../models/listener.model.js'

const adminAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = decoded;

        const user = await User.findById(req.user.id);
        const listener = await Listener.findById(req.user.id);

        if ((user && user.isAdmin) || (listener && listener.isAdmin)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export default adminAuth;