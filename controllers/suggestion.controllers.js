import Suggest from "../models/suggestion.model.js";
import User from "../models/User.model.js";
import Listener from "../models/listener.model.js";

export const addSuggestion = async (req, res) => {
    const { description } = req.body;
    const { _id: userId, role: userType } = req.user;

    if (!userId || !userType || !description) {
        return res.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
    }

    // userType'ı böyük herf çevir
    const formattedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

    try {
        const newSuggestion = await Suggest.create({ userId, userType: formattedUserType, description });

        if (formattedUserType === 'User') {
            await User.findByIdAndUpdate(userId, { $push: { suggests: newSuggestion._id } });
        } else if (formattedUserType === 'Listener') {
            await Listener.findByIdAndUpdate(userId, { $push: { suggests: newSuggestion._id } });
        }

        res.status(201).send({ suggestion: newSuggestion });
    } catch (error) {
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const getUserSuggestions = async (req, res) => {
    const { _id: userId, role: userType } = req.user;
    console.log(userType, userId);

    // userType'ı büyük harfe çevir
    const formattedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

    try {
        let suggestions;

        // Kullanıcının türüne göre uygun sorgu 
        if (formattedUserType === 'User') {
            const user = await User.findById(userId).populate('suggests');
            suggestions = user.suggests;
        } else if (formattedUserType === 'Listener') {
            const listener = await Listener.findById(userId).populate('suggests');
            suggestions = listener.suggests;
        } else {
            return res.status(400).send({ error: "Invalid user type" });
        }

        res.status(200).send(suggestions);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const getAllSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggest.find().populate({
            path: 'userId',
            model: req.user.role === 'listener' ? Listener : User, 
            select: 'username' 
        }).sort({createdAt:-1})

        res.status(200).send(suggestions);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        res.status(500).send({ error: 'Server xətası' });
    }
};

