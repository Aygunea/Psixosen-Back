import Complaint from "../models/complaint.model.js"
import Listener from "../models/listener.model.js";
import User from "../models/User.model.js";

export const addComplaint = async (req, res) => {
    const { title, description, complainedAboutUsername } = req.body;
    const { _id: complainantId, role: complainantType } = req.user;
    let complainedAboutId;
    let complainedAboutType;

    try {
        if (!title || !description || !complainedAboutUsername) {
            return res.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }
        const formattedComplainantType = complainantType.charAt(0).toUpperCase() + complainantType.slice(1);

        if (formattedComplainantType === 'User') {
            complainedAboutType = 'Listener';
            const listener = await Listener.findOne({ nickname: complainedAboutUsername });
            if (!listener) {
                return res.status(404).send({ message: "Belə bir dinləyici tapılmadı" });;
            }
            complainedAboutId = listener._id;
        } else if (formattedComplainantType === 'Listener') {
            complainedAboutType = 'User';
            const user = await User.findOne({ username: complainedAboutUsername });
            if (!user) {
                return res.status(404).send({ message: "Belə bir danışan tapılmadı" });;
            }
            complainedAboutId = user._id;
        }

        const newComplaint = await Complaint.create({
            complainantId,
            complainantType: formattedComplainantType,
            complainedAboutId,
            complainedAboutType,
            title,
            description
        });

        if (formattedComplainantType === 'User') {
            const listener = await Listener.findById(complainedAboutId);
            listener.complaints.push(newComplaint._id);
            await listener.save();
        } else if (formattedComplainantType === 'Listener') {
            const user = await User.findById(complainedAboutId);
            user.complaints.push(newComplaint._id);
            await user.save();
        }

        res.status(201).send(
            {
                message: "Sizin şikayətiniz uğurla göndərildi!",
                data: newComplaint
            });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).send({ error: 'Server xətası' });
    }
};

export const getComplaintList = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 }); 
        if (!complaints || complaints.length === 0) {
            return res.status(404).send({ error: "Complaint not found" });
        }

        const enrichedComplaints = await Promise.all(complaints.map(async (complaint) => {
            const complainant = complaint.complainantType === 'User'
                ? await User.findById(complaint.complainantId).select('username')
                : await Listener.findById(complaint.complainantId).select('username');

            const complainedAbout = complaint.complainedAboutType === 'User'
                ? await User.findById(complaint.complainedAboutId).select('username')
                : await Listener.findById(complaint.complainedAboutId).select('username');

            return {
                ...complaint._doc,
                complainantUsername: complainant ? complainant.username : '',
                complainedAboutUsername: complainedAbout ? complainedAbout.username : ''
            };
        }));

        res.status(200).send(enrichedComplaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).send({ error: 'Server xətası' });
    }
}
