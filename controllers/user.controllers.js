import User from '../models/User.model.js'
export const getAllUsers = async (request, response) => {
    // const clientId = request.user._id
    const filteredUsers = await User.find()
    response.status(200).send(filteredUsers)
}

export const getSpecificUser = async (request, response) => {
    const { _id: userId } = request.user;
    const specificUser = await User.findOne({ _id: userId })
    response.status(200).send(specificUser)
}
