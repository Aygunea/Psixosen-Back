import Session from '../models/session.model.js';
import Conversation from '../models/conversation.model.js';

export const getSharedContacts = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            throw new Error('User ID is missing from request');
        }
        const userId = req.user._id;

        const sessions = await Session.find({
            $or: [{ userId }, { listenerId: userId }]
        }).populate('userId listenerId');

        const contacts = sessions.reduce((acc, session) => {
            if (session.userId && session.userId._id.toString() !== userId.toString()) {
                acc.push({
                    type: 'user',
                    contact: session.userId
                });
            }
            if (session.listenerId && session.listenerId._id.toString() !== userId.toString()) {
                acc.push({
                    type: 'listener',
                    contact: session.listenerId
                });
            }
            return acc;
        }, []);

        // Filter out duplicates
        const uniqueContacts = Array.from(new Set(contacts.map(JSON.stringify))).map(JSON.parse);

        // Fetch last messages for each unique contact
        for (const contact of uniqueContacts) {
            const conversation = await Conversation.findOne({
                participants: {
                    $elemMatch: { id: contact.contact._id }
                }
            }).populate('lastMessage'); 

            contact.lastMessage = conversation ? conversation.lastMessage : null; 
        }
        res.status(200).send(uniqueContacts);
    } catch (error) {
        console.error('Error retrieving shared contacts:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};
