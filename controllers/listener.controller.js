import Listener from '../models/listener.model.js'

export const getAllListeners = async (request, response) => {
    const filteredListeners = await Listener.find()
    response.status(200).send(filteredListeners)
}
export const getSpecificListener = async (request, response) => {
    const { _id: listenerId } = request.user;
    const specificListener = await Listener.findOne({ _id: listenerId })
    response.status(200).send(specificListener)
}
export const updateListener = async (req, res) => {
    const { _id: listenerId } = req.user;
    const { nickname, username, email, phone } = req.body;

    try {
        const updatedListener = await Listener.findByIdAndUpdate(
            listenerId,
            { nickname, username, email, phone },
            { new: true, runValidators: true }
        );

        if (!updatedListener) {
            return res.status(404).send({ message: "Listener not found" });
        }

        res.status(200).send(updatedListener);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};