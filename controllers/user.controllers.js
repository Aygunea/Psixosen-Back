import User from '../models/User.model.js'
export const getAllUsers = async (request, response) => {
    const filteredUsers = await User.find().sort({ createdAt: -1 });
    response.status(200).send(filteredUsers)
}

export const getSpecificUser = async (request, response) => {
    // const { _id: userId } = request.user;
    const { userId } = request.params; 

    const specificUser = await User.findById(userId)
    console.log(specificUser + 'specific user');
    if (!specificUser) {
        return response.status(404).send({ message: "Belə istifadəçi tapılmadı" });
    }
    response.status(200).send(specificUser)
}
