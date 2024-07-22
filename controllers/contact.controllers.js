import Session from '../models/session.model.js';
import Conversation from '../models/conversation.model.js';


// Controller function to get contacts
export const getSharedContacts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find sessions where the user is either the session creator or the listener
        const sessions = await Session.find({
            $or: [{ userId }, { listenerId: userId }]
        }).populate('userId listenerId');

        // Extract unique contacts
        const contacts = sessions.reduce((acc, session) => {
            if (session.userId._id.toString() !== userId.toString()) {
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
            }).populate('lastMessage'); // lastMessage'i populate et

            contact.lastMessage = conversation ? conversation.lastMessage : null; // lastMessage ekle
        }
        res.status(200).send(uniqueContacts);
    } catch (error) {
        console.error('Error retrieving shared contacts:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};


