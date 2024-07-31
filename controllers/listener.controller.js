import Listener from '../models/listener.model.js'

export const getAllListeners = async (req, res) => {
    try {
        const { isAdmin } = req.user; 

        // If the user is an admin, return all listeners
        if (isAdmin) {
            const filteredListeners = await Listener.find();
            return res.status(200).send(filteredListeners);
        }

        // If the user is not an admin, return only active listeners except the requesting user
        const { _id: userId } = req.user; 
        const filteredListeners = await Listener.find({
            isActive: true,
            _id: { $ne: userId } 
        });

        return res.status(200).send(filteredListeners);

    } catch (error) {
        console.error("Error fetching listeners:", error);
        return res.status(500).send({ message: "Server error" });
    }
};

export const getSpecificListener = async (request, response) => {
    const { _id: listenerId } = request.user;
    const specificListener = await Listener.findOne({ _id: listenerId })
    response.status(200).send(specificListener)
}

export const getSingleListener = async (request, response) => {
    const { listenerId } = request.params; 
    try {
        const specificListener = await Listener.findById(listenerId); 
        if (!specificListener) {
            return response.status(404).send({ message: "Listener not found" });
        }
        response.status(200).send(specificListener);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
}

export const toggleListenerActivation = async (req, res) => {
    const { listenerId } = req.params;

    try {
        const listener = await Listener.findById(listenerId);

        if (!listener) {
            return res.status(404).send({ message: "Dinleyici bulunamadı" });
        }

        listener.isActive = !listener.isActive; 
        await listener.save();

        res.status(200).send(listener);
    } catch (error) {
        console.error("Aktivasyon hatası:", error);
        res.status(500).send({ message: "Sunucu hatası" });
    }
};

export const activateListener = async (req, res) => {
    const { listenerId } = req.params; 

    try {
        const listener = await Listener.findById(listenerId);

        if (!listener) {
            return res.status(404).send({ message: "Dinleyici bulunamadı" });
        }

        listener.isActive = true;
        await listener.save();

        res.status(200).send(listener);
    } catch (error) {
        console.error("Aktivasyon hatası:", error);
        res.status(500).send({ message: "Sunucu hatası" });
    }
};

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
