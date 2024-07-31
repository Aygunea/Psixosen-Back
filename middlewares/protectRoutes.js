import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import Listener from '../models/listener.model.js'

const protectRoutes = async (request, response, next) => {
    try {
        const token = request.cookies.jwt
        if (!token) {
            return response.status(401).send({ message: "Not authorized" })
        }
        const decode = jwt.verify(token, process.env.JWT_TOKEN)
        if (!decode) {
            return response.status(401).send({ message: "Invalid Token" })
        }
        let user;
        if (decode.role === 'listener') {
            user = await Listener.findOne({ _id: decode._id });
        } else {
            user = await User.findOne({ _id: decode._id });
        }
        if (!user) {
            return response.status(401).send({ message: "User not found" })
        }
        request.user = user
        request.user.role = decode.role;

        next()
    } catch (error) {
        return response.status(500).send(`Error in middleware: ${error}`)
    }
}
export default protectRoutes
