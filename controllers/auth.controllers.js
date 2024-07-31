import jwt from 'jsonwebtoken'
import User from '../models/User.model.js';
import Listener from '../models/listener.model.js';
import bcrypt from 'bcrypt';
import { generateTokenAndSetCookie } from '../utils/generatetokenandsetcookie.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aygunea@code.edu.az',
        pass: 'pvld xwka lbev kgbx'
    }
});

export const signup = async (request, response) => {
    try {
        const { role, isAdmin, email, password, username, nickname, confirmpassword, gender, phone, education, fieldOfActivity, experience, languages, category } = request.body;
        // Check if required fields are missing
        if (!email || !password || !username || !confirmpassword || !gender) {
            return response.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }
        // Check if username already exists
        const existingUserUsername = await User.findOne({ username });
        const existingListenerUsername = await Listener.findOne({ username });
        if (existingUserUsername || existingListenerUsername) {
            return response.status(400).send({ message: 'Bu istifadəçi adı artıq mövcuddur' });
        }

        // Check if email already exists
        const existingUserEmail = await User.findOne({ email });
        const existingListenerEmail = await Listener.findOne({ email });
        if (existingUserEmail || existingListenerEmail) {
            return response.status(400).send({ message: 'Bu e-poçt ünvanı ilə qeydiyyat artıq mövcuddur' });
        }

        // Check if phone already exists
        const existingPhone = await Listener.findOne({ phone });
        if (existingPhone) {
            return response.status(400).send({ message: 'Bu nömrə ilə qeydiyyat artıq mövcuddur' });
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            return response.status(400).send({ message: "Şifrələr uyğun deyil" });
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
            if (!phone || !nickname  || !education || !fieldOfActivity || !experience || !languages || !category) {
                return response.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
            }

            // Create new listener with diploma path
            newUser = await Listener.create({
                email,
                password: hashedPassword,
                username,
                nickname,
                gender,
                profilePic: gender === 'female' ? girlProfilePic : boyProfilePic,
                phone,
                education,
                fieldOfActivity,
                experience,
                languages,
                category,
                isAdmin,
                isActive: false
            });
        } else {
            // Create new user 
            newUser = await User.create({
                email,
                password: hashedPassword,
                username,
                gender,
                profilePic: gender === 'female' ? girlProfilePic : boyProfilePic,
                isAdmin
            });
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(newUser._id, role, response);
        response.status(201).send({
            message: 'Yeni istifadəçi uğurla yaradıldı.',
            newUser
        });

    } catch (error) {
        console.error(error);
        return response.status(500).send({ error: 'Server xətası' });
    }
};

export const signin = async (request, response) => {
    try {
        const { role, password, email } = request.body;
        // Check if all fields are provided based on role
        if (!email || !password) {
            return response.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }

        let user;
        if (role === 'listener') {
            user = await Listener.findOne({ email }).select('+password');
        } else {
            user = await User.findOne({ email }).select('+password');
        }

        // Check if user exists
        if (!user) {
            return response.status(400).send({ message: "Belə bir istifadəçi tapılmadı" });;
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return response.status(400).send({ message: "Şifrə yanlışdır" });
        }

        if (role === 'listener' && !user.isActive) {
            return response.status(403).send({ message: "Hesabınız aktiv deyil. Zəhmət olmasa admin ilə əlaqə saxlayın." });
        }
        // Generate token and set cookie
        generateTokenAndSetCookie(user._id, role, response);
        response.status(201).send(user);

    } catch (error) {
        console.error(error);
        return response.status(500).send({ error: 'Server xətası' });
    }
};

export const logout = async (request, response) => {
    try {
        response.cookie("jwt", "");
        response.status(200).send({ message: "Hesabdan çıxış etdiniz" });
    } catch (error) {
        return response.status(500).send({ error: 'Server xətası' });
    }
};

// Change password function
export const resetPassword = async (request, res) => {
    try {
        const { role, userId, currentPassword, newPassword, confirmNewPassword } = request.body;
        console.log(currentPassword, newPassword, confirmNewPassword, role, userId);
        // Check if all required fields are provided
        if (!role || !userId || !currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).send({ message: "Zəhmət olmasa bütün xanaları doldurun" });
        }

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).send({ message: "Şifrələr uyğun deyil" });
        }

        let user;
        if (role === 'listener') {
            user = await Listener.findById(userId).select('+password');
        } else {
            user = await User.findById(userId).select('+password');
        }

        // Check if user exists
        if (!user) {
            return res.status(404).send({ message: "Belə istifadəçi tapılmadı" });;
        }

        // Check if current password is correct
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send({ message: "Keçmiş şifrəniz yanlışdır" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).send({ message: "Şifrə uğurla yeniləndi" });;

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Server xətası' });
    }
};

export const verifyPassword = async (request, res) => {
    try {
        const { role, userId, currentPassword } = request.body;

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
        return res.status(500).send({ error: 'Server xətası' });
    }
};

export const forgetPassword = async (request, res) => {
    const { email } = request.body;

    if (!email) {
        return res.status(400).send({ message: "Zəhmət olmasa e-poçt ünvanınızı daxil edin" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ message: "Bu e-poçt adresi ilə qeydiyyatdan keçmiş istifadəçi yoxdur" });
    }

    const resetToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_TOKEN, { expiresIn: '1h' });


    var mailOptions = {
        from: 'aygunea@code.edu.az',
        to: email,
        subject: 'Şifrənizi yeniləyin',
        html: `
        <p>Şifrənizi yeniləmək üçün aşağıdakı linkə klikləyin:</p>
        <a href="http://localhost:3000/reset-password/${user._id}/${resetToken}">Şifrəni sıfırla</a>
    `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return res.status(500).send({ message: "Email göndərilə bilmədi" });
        } else {
            return res.send({ message: 'Şifrə sıfırlama linki e-poçt ünvanınıza göndərildi' });
        }
    });
};

export const resetPasswordWithMail = async (req, res) => {
    const { token, newPassword, confirmNewPassword } = request.body;

    // Yeni şifrelerin aynı olduğundan emin olun
    if (newPassword !== confirmNewPassword) {
        return res.status(400).send({ message: "Şifrələr uyğun deyil" });
    }

    // Token'ın geçerli olup olmadığını kontrol edin
    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);

        let user;
        if (decoded.role === 'listener') {
            user = await Listener.findOne({ _id: decoded._id });
        } else {
            user = await User.findOne({ _id: decoded._id });
        }

        if (!user) {
            return res.status(400).send({ message: "Belə bir istifadəçi tapılmadı" });;
        }

        // Yeni şifreyi hashleyin ve kaydedin
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).send({ message: "Şifrə uğurla yeniləndi" });
    } catch (error) {
        return res.status(400).send({ message: "Yeniləmə müddəti bitmişdir" });
    }
};


// export const uploadDiploma = upload.single('diploma');
