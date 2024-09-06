require('dotenv').config();

const { Router } = require('express')
const express = require('express')
const Admin = require('../models/Admin')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { sendPasswordResetEmail } = require('../sendPassword');
const AdminBar = require('../models/AdminBar');
const Support = require('../models/Support');
const Online = require('../models/Online');
const ONLINE_JWT_SECRET="online@admin123"
const SUPERADMIN_JWT_SECRET = "superadmin@admin123"


// One time setup to store and create user in Database
// http://localhost:5000/api/auth/online-setup
router.post('/online-setup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the online user already exists
        const existingOnlineUser = await Online.findOne({ $or: [{ username }, { email }] });
        if (existingOnlineUser) {
            return res.status(400).json({ message: 'Online user with the same username, email, or mobile number already exists' });
        }

        // Hash the plain password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new online user with the hashed password
        const newOnline = new Online({
            username,
            email,
            password: hashedPassword,
        });

        // Save the online user to the database
        await newOnline.save();

        return res.status(201).json({ message: 'Online user setup successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// One time setup to store and create user in Database 
// http://localhost:5000/api/auth/setup 
router.post('/setup', async (req, res) => {
    const { username, email, password,mobileNumber } = req.body;

    try {
        // Check if the admin already exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin with the same username or email already exists' });
        }

        // Hash the plain password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin with the hashed password
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
            mobileNumber
        });

        // Save the admin to the database
        await newAdmin.save();

        return res.status(201).json({ message: 'Admin setup successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});



// router.post('/barSetup', async (req, res) => {
//     const { username, email, password,mobileNumber } = req.body;

//     try {
//         // Check if the admin already exists
//         const existingAdmin = await Admin.findOne({ $or: [{ username }] }) || await AdminBar.findOne({ $or: [{ username }] });
//         if (existingAdmin) {
//             return res.status(400).json({ message: 'Admin of Bar with the same username or email already exists' });
//         }

//         // Hash the plain password using bcryptjs
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new admin with the hashed password
//         const newAdmin = new AdminBar({
//             username,
//             email,
//             password: hashedPassword,
//             mobileNumber,
//             isBar: true
//         });

//         // Save the admin to the database
//         await newAdmin.save();

//         return res.status(201).json({ message: 'Admin Bar setup successful' });
//     } catch (error) {
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });

router.post('/barSetup', async (req, res) => {
    const { username, email, password, mobileNumber } = req.body;

    try {
        // Check if any record already exists in AdminBar collection
        const existingAdmin = await AdminBar.findOne({});
        
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin Bar already exists. Only one record is allowed.' });
        }

        // Hash the plain password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new admin with the hashed password
        const newAdmin = new AdminBar({
            username,
            email,
            password: hashedPassword,
            mobileNumber,
            isBar: true
        });

        // Save the admin to the database
        await newAdmin.save();

        return res.status(201).json({ message: 'Admin Bar setup successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// // login Admin
// // http://localhost:5000/api/auth/login
// router.post('/login', [
//     body('username', 'Enter a valid username').exists(),
//     body('password', 'Password cannot be blank').exists(),
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     const { username, password } = req.body;

//     try {
//         // Retrieve the hashed password for the user based on username
//         let user = await Admin.findOne({ username });
//         let role = 'admin';

//         if (!user) {
//             user = await AdminBar.findOne({ username });
//             role = 'adminBar';
//         }

//         if (!user) {
//             return res.status(401).json({ message: 'Authentication failed' });
//         }

//         // Compare the entered plain password with the hashed password in the database
//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (passwordMatch) {
//             const token = jwt.sign(
//                 { username: user.username, role: role, email: user.email },
//                 SUPERADMIN_JWT_SECRET
//             );

//             return res.status(200).json({ message: 'Authentication successful', token });
//         } else {
//             // Passwords don't match, authentication failed
//             return res.status(401).json({ message: 'Authentication failed' });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Online user login
router.post('/loginOnline', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        // Retrieve the hashed password for the Online user based on username
        let user = await Online.findOne({ username });
        let role = 'online';

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }


        // Compare the entered plain password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Delete the record from the Admin collection if the email matches
            await Admin.findOneAndDelete({ email: user.email });

            const token = jwt.sign(
                { username: user.username, role, email: user.email },
                ONLINE_JWT_SECRET,
                { expiresIn: '1h' } // Token expiration time
            );

            return res.status(200).json({ message: 'Authentication successful', token });
        } else {
            // Passwords don't match, authentication failed
            return res.status(401).json({ message: 'Authentication failed !!' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// login Admin
// http://localhost:5000/api/auth/login
router.post('/login', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;

    try {
        // Retrieve the user based on the username
        let user = await Admin.findOne({ username });
        let role = 'admin';

        if (!user) {
            user = await AdminBar.findOne({ username });
            role = 'adminBar';
        }

        if (!user) {
            user = await Support.findOne({ username });
            role = 'online';
        }

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Check if the endDate is greater than the current date
        if (user.endDate && moment(user.endDate).isBefore(moment(), 'day')) {
            return res.status(401).json({ message: 'Authentication failed. Token is not yet valid or has expired.' });
        }

        // Compare the entered plain password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign(
                { username: user.username, role: role, email: user.email },
                SUPERADMIN_JWT_SECRET
            );

            return res.status(200).json({ message: 'Authentication successful', token });
        } else {
            // Passwords don't match, authentication failed
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }catch (error) {
        console.error('Error during login:', error);  // Log the error details
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// bar login
router.post('/loginBar', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;

    try {
        // Retrieve the hashed password for the admin or adminBar based on username
        let user = await AdminBar.findOne({ username });
        let role = 'adminBar';

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

         // Check if the endDate is greater than the current date
         if (user.endDate && moment(user.endDate).isBefore(moment(), 'day')) {
            return res.status(401).json({ message: 'Authentication failed. Token is not yet valid or has expired.' });
        }

        // Compare the entered plain password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Delete the record from the Admin collection if the email matches
            await Admin.findOneAndDelete({ email: user.email });

            const token = jwt.sign(
                { username: user.username, role, email: user.email },
                SUPERADMIN_JWT_SECRET,
                { expiresIn: '1h' } // Token expiration time
            );

            return res.status(200).json({ message: 'Authentication successful', token });
        } else {
            // Passwords don't match, authentication failed
            return res.status(401).json({ message: 'Authentication failed !!' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// update barState
router.post('/updateBarState', [
    body('email', 'Enter a valid username').exists(),
    body('isBar', 'isBar must be a boolean').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, isBar } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        admin.isBar = isBar;
        await admin.save();

        return res.status(200).json({ message: 'isBar state updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
});



// GET API to fetch AdminBar records where endDate is less than 2 or 5 days from now
router.get('/adminBar/expiring-soon', async (req, res) => {
    try {
        // Get the current date
        const currentDate = moment();

        // Calculate the dates for the 2 days and 5 days thresholds
        const twoDaysFromNow = currentDate.clone().add(2, 'days').toDate();
        const fiveDaysFromNow = currentDate.clone().add(5, 'days').toDate();

        // Query to find records where endDate is within 2 to 5 days from now
        const expiringSoon = await AdminBar.find({
            endDate: { $gte: currentDate.toDate(), $lte: fiveDaysFromNow }
        });

        res.status(200).json(expiringSoon);
    } catch (error) {
        console.error('Error fetching expiring records:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET API to fetch AdminBar records where endDate is less than 2 or 5 days from now
router.get('/admin/expiring-soon', async (req, res) => {
    try {
        // Get the current date
        const currentDate = moment();

        // Calculate the dates for the 2 days and 5 days thresholds
        const twoDaysFromNow = currentDate.clone().add(2, 'days').toDate();
        const fiveDaysFromNow = currentDate.clone().add(5, 'days').toDate();

        // Query to find records where endDate is within 2 to 5 days from now
        const expiringSoon = await Admin.find({
            endDate: { $gte: currentDate.toDate(), $lte: fiveDaysFromNow }
        });

        res.status(200).json(expiringSoon);
    } catch (error) {
        console.error('Error fetching expiring records:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


//  Route to change the password
// http://localhost:5000/api/auth/changePassword
router.post('/changePassword', [
    body('username', 'Enter a valid username').exists(),
    body('currentPassword', 'Current password cannot be blank').exists(),
    body('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, currentPassword, newPassword } = req.body;

    try {
        // Find the user based on username in any of the three collections
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        let user;
        if (admin) {
            user = admin;
        }

        // Compare the current password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (passwordMatch) {
            // Hash the new password using bcryptjs
            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedNewPassword;
            await user.save();

            return res.status(200).json({ message: 'Password updated successfully' });
        } else {
            // Current password does not match, authentication failed
            return res.status(401).json({ message: 'Authentication failed' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Route to Forgot Password
// http://localhost:5000/api/auth/forgotPassword
router.post('/forgotPassword', [
    body('username', 'Enter a valid username').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    const generateUniqueToken = () => {
        return uuidv4();
    }

    try {
        // Retrieve the admin based on username
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Generate a unique token for password reset (you can use a library like `uuid`)
        const resetToken = generateUniqueToken(); // Implement this function

        // Store the reset token and its expiration date in the database
        admin.resetToken = resetToken;
        admin.resetTokenExpires = Date.now() + 900000; // Token expires in 1 hour
        await admin.save();

        // Send a password reset email to the user
        sendPasswordResetEmail(admin.email, resetToken); // Implement this function
        return res.status(200).json({ message: 'Password reset email sent successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});



// Route to Reset Password
// http://localhost:5000/api/auth/resetPassword/:resetToken
router.post('/resetPassword/:resetToken', [
    body('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    const { resetToken } = req.params;

    try {
        // Find the admin by the reset token and ensure it has not expired
        const admin = await Admin.findOne({ resetToken, resetTokenExpires: { $gt: Date.now() } });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash the new password using bcryptjs
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the admin's password and clear the reset token
        admin.password = hashedNewPassword;
        admin.resetToken = undefined;
        admin.resetTokenExpires = undefined;
        await admin.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});





module.exports = router