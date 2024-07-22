import User from '../models/User.model.js';
import Listener from '../models/listener.model.js';
import bcrypt from 'bcrypt';
import { generateTokenAndSetCookie } from '../utils/generatetokenandsetcookie.js';


export const signup = async (request, response) => {
    try {
        const { role, email, password, username, nickname, confirmpassword, diploma, gender, phone, birth, education, fieldOfActivity, experience, languages, additions, category } = request.body;
        console.log(email,
            password,
            username,
            nickname,
            gender,
            phone,
            birth,
            education,
            fieldOfActivity,
            experience,
            languages,
            additions,
            category, diploma);
        // Check if required fields are missing
        if (!email || !password || !username || !confirmpassword || !gender) {
            return response.status(400).send('Please fill all fields');
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            return response.status(400).send('Passwords do not match');
        }

        // Check if email or phone already exists
        const existingPhone = await Listener.findOne({ phone });
        if (existingPhone) {
            return response.status(400).send({ error: 'Phone phone already exists' });
        }

        const existingUserEmail = await User.findOne({ email });
        const existingListenerEmail = await Listener.findOne({ email });
        if (existingUserEmail || existingListenerEmail) {
            return response.status(400).send({ error: 'Email already exists' });
        }

        // Generate profile picture URLs based on gender
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser;
        if (role === 'listener') {
            // Check if all fields for listener are provided
            if (!phone || !nickname || !birth || !diploma || !education || !fieldOfActivity || !experience || !languages || !additions || !category) {
                return response.status(400).send('Please fill all fields for listener');
            }

            // Check if diploma file is uploaded
            // const { path } = request.file;
            // console.log(request.file);
            // if (!path) {
            //     return response.status(400).send('Please upload your diploma');
            // }

            // Create new listener with diploma path
            newUser = await Listener.create({
                email,
                password: hashedPassword,
                username,
                nickname,
                gender,
                profilePic: gender === 'female' ? girlProfilePic : boyProfilePic,
                phone,
                birth,
                education,
                diploma,
                // diploma: path,
                fieldOfActivity,
                experience,
                languages,
                additions,
                category
            });
        } else {
            // Create new user without diploma
            newUser = await User.create({
                email,
                password: hashedPassword,
                username,
                gender,
                profilePic: gender === 'female' ? girlProfilePic : boyProfilePic
            });
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(newUser._id, role, response);
        response.status(201).json({ newUser });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ message: 'Internal server error during signup' });
    }
};

export const signin = async (request, response) => {
    try {
        const { role, password, username, phone } = request.body;

        // Check if all fields are provided based on role
        if (role === 'listener' && (!phone || !password)) {
            return response.status(400).send("Please fill all fields for listener");
        } else if (role === 'user' && (!username || !password)) {
            return response.status(400).send("Please fill all fields for user");
        }

        let user;
        if (role === 'listener') {
            user = await Listener.findOne({ phone }).select('+password');
        } else {
            user = await User.findOne({ username }).select('+password');
        }

        // Check if user exists
        if (!user) {
            return response.status(400).send("You don't have an account");
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return response.status(400).send("Wrong password");
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(user._id, role, response);
        response.status(201).send(user);

    } catch (error) {
        console.error(error);
        return response.status(500).send({ error: "Internal server error" });
    }
};

export const logout = async (request, response) => {
    try {
        // Clear JWT cookie
        response.cookie("jwt", "");
        response.status(200).send({ message: "Successfully logged out" });
    } catch (error) {
        return response.status(500).send({ error: "Internal server error" });
    }
};

// Change password function
export const resetPassword = async (req, res) => {
    try {
        const { role, userId, currentPassword, newPassword, confirmNewPassword } = req.body;
        console.log(currentPassword, newPassword, confirmNewPassword, role, userId);
        // Check if all required fields are provided
        if (!role || !userId || !currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).send("Please fill all fields");
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).send("New passwords do not match");
        }

        let user;
        if (role === 'listener') {
            user = await Listener.findById(userId).select('+password');
        } else {
            user = await User.findById(userId).select('+password');
        }

        // Check if user exists
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if current password is correct
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send("Current password is incorrect");
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).send({ message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
};

export const verifyPassword = async (req, res) => {
    try {
        const { role, userId, currentPassword } = req.body;

        let user;
        if (role === 'listener') {
            user = await Listener.findById(userId).select('+password');
        } else {
            user = await User.findById(userId).select('+password');
        }

        // Check if user exists
        if (!user) {
            return res.status(404).send({ isPasswordCorrect: false });
        }

        // Check if current password is correct
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        res.status(200).send({ isPasswordCorrect });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
};


// export const uploadDiploma = upload.single('diploma');
