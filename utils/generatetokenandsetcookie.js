import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (_id, role, response) => {
    const payload = {
        _id: _id,
        role: role
    };
    const token = jwt.sign(payload, process.env.JWT_TOKEN, {
        expiresIn: "15d",
    })
    response.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
    })
}