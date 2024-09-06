const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/Token');
const Admin = require('../models/Admin');
const AdminBar = require('../models/AdminBar');
const CounterAdmin = require('../models/counterAdmin');
const moment = require('moment');
const router = express.Router();
const app = express();
app.use(express.json());

const secretKey = bcrypt.hashSync('your-256-bit-secret', 10); // Encrypted secret key

// API to create a 15-day JWT token
// API to create a 15-day JWT token
// router.post('/createToken15Days', async (req, res) => {
//     const { companyName, mobileNumber } = req.body;

//     // Generate JWT token with 15-day validity
//     const token15Days = jwt.sign({ companyName, mobileNumber, validity: '15 days' }, secretKey, { expiresIn: '15d' });

//     // Save the token in MongoDB
//     await Token.create({ companyName, mobileNumber, validity: '15 days', jwtToken: token15Days });

//     res.json({
//         message: '15-day token generated successfully',
//         token: token15Days
//     });
// });

// API to create a 15-day JWT token
router.post('/createToken15Days', async (req, res) => {
    const { companyName, mobileNumber } = req.body;

    try {
        // Check if a token for this mobile number already exists
        const existingToken = await Token.findOne({ mobileNumber });

        if (existingToken) {
            return res.status(409).json({ message: 'A token for this mobile number already exists' });
        }

        // Generate JWT token with 15-day validity
        const token15Days = jwt.sign({ companyName, mobileNumber, validity: '15 days' }, secretKey, { expiresIn: '15d' });

        // Save the token in MongoDB
        await Token.create({ companyName, mobileNumber, validity: '15 days', jwtToken: token15Days });

        res.json({
            message: '15-day token generated successfully',
            token: token15Days
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: 'Error generating token', error: error.message });
    }
});

// // API to create a 30-day JWT token
// router.post('/createToken30Days', async (req, res) => {
//     const { companyName, mobileNumber } = req.body;

//     // Generate JWT token with 30-day validity
//     const token30Days = jwt.sign({ companyName, mobileNumber, validity: '30 days' }, secretKey, { expiresIn: '30d' });

//     // Save the token in MongoDB
//     await Token.create({ companyName, mobileNumber, validity: '30 days', jwtToken: token30Days });

//     res.json({
//         message: '30-day token generated successfully',
//         token: token30Days
//     });
// });

// API to create a 30-day JWT token
router.post('/createToken30Days', async (req, res) => {
    const { companyName, mobileNumber } = req.body;

    try {
        // Generate JWT token with 30-day validity
        const token30Days = jwt.sign(
            { companyName, mobileNumber, validity: '30 days' }, // Payload
            secretKey,                                          // Secret key
            { expiresIn: '30d' }                                // Options
        );

        // Save the token in MongoDB
        await Token.create({
            companyName,
            mobileNumber,
            validity: '30 days',
            jwtToken: token30Days
        });

        // Respond with the generated token
        res.json({
            message: '30-day token generated successfully',
            token: token30Days
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ message: 'Error generating token', error });
    }
});

// API to create a 365-day JWT token
router.post('/createToken365Days', async (req, res) => {
    const { companyName, mobileNumber } = req.body;

    // Generate JWT token with 365-day validity
    const token365Days = jwt.sign({ companyName, mobileNumber, validity: '365 days' }, secretKey, { expiresIn: '365d' });

    // Save the token in MongoDB
    await Token.create({ companyName, mobileNumber, validity: '365 days', jwtToken: token365Days });

    res.json({
        message: '365-day token generated successfully',
        token: token365Days
    });
});

// // API to list all registered tokens with remaining days
// router.get('/listTokens', async (req, res) => {
//     const tokens = await Token.find({ status: 'active' });

//     const tokensWithDaysRemaining = tokens.map(token => {
//         const expirationDate = moment(token.createdAt).add(parseInt(token.validity.split(' ')[0]), 'days');
//         const daysRemaining = expirationDate.diff(moment(), 'days');

//         return {
//             companyName: token.companyName,
//             _id:token._id,
//             mobileNumber: token.mobileNumber,
//             validity: token.validity,
//             status:token.status,
//             daysRemaining
//         };
//     });

//     res.json(tokensWithDaysRemaining);
// });

// API to list all registered tokens with remaining days and full token details
router.get('/listTokens', async (req, res) => {
    try {
        const tokens = await Token.find({});

        const tokensWithDaysRemaining = tokens.map(token => {
            const expirationDate = moment(token.createdAt).add(parseInt(token.validity.split(' ')[0]), 'days');
            const daysRemaining = expirationDate.diff(moment(), 'days');

            return {
                ...token.toObject(), // Spread the full token data
                daysRemaining       // Add the calculated days remaining
            };
        });

        res.json(tokensWithDaysRemaining);
    } catch (error) {
        console.error('Error fetching tokens:', error);
        res.status(500).json({ message: 'Error fetching tokens', error: error.message });
    }
});

// API to compare and deactivate JWT token
router.post('/deactivateToken', async (req, res) => {
    const { token } = req.body;

    const decodedToken = jwt.verify(token, secretKey);

    const existingToken = await Token.findOne({ jwtToken: token, status: 'active' });

    if (!existingToken) {
        return res.status(400).json({ message: 'Token is either invalid or already inactive' });
    }

    existingToken.status = 'inactive';
    await existingToken.save();

    res.json({ message: 'Token deactivated successfully' });
});

// // GET API to fetch token information by company ID
// router.get('/getToken/:companyId', async (req, res) => {
//     const { companyId } = req.params;

//     try {
//         // Find the token associated with the company ID
//         const token = await Token.findOne({ _id: companyId });

//         if (token) {
//             res.json({
//                 jwtToken: token.jwtToken,
//                 companyName: token.companyName,
//                 mobileNumber: token.mobileNumber,
//                 daysRemaining: token.daysRemaining
//             });
//         } else {
//             res.status(404).json({ message: 'Company not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching token information', error: error.message });
//     }
// });

// GET API to fetch token information by company ID
router.get('/getToken/:companyId', async (req, res) => {
    const { companyId } = req.params;

    try {
        // Find the token associated with the company ID
        const token = await Token.findOne({ _id: companyId }).lean();

        if (token) {
            // Manually calculate the daysRemaining and add it to the token object
            const currentDate = new Date();
            let daysDiff;

            if (token.endDate) {
                const timeDiff = new Date(token.endDate) - currentDate;
                daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                // Ensure daysRemaining is not negative
                if (daysDiff < 0) {
                    daysDiff = 0;
                }
            } else {
                // Set daysRemaining to 0 if endDate is null
                daysDiff = 0;
            }

            token.daysRemaining = daysDiff;

            res.json({
                jwtToken: token.jwtToken,
                companyName: token.companyName,
                mobileNumber: token.mobileNumber,
                daysRemaining: token.daysRemaining
            });
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching token information', error: error.message });
    }
});

// // PATCH API to update JWT token with 15-day validity
// router.patch('/updateToken15Days/:companyId', async (req, res) => {
//     const { companyId } = req.params;
//     const { companyName, mobileNumber } = req.body;

//     console.log('Updating token for company ID:', companyId);

//     // Generate new JWT token with 15-day validity
//     const token15Days = jwt.sign({ companyName, mobileNumber, validity: '15 days' }, secretKey, { expiresIn: '15d' });

//     // Update the token in MongoDB
//     const updatedToken = await Token.findOneAndUpdate(
//         { _id: companyId },
//         { jwtToken: token15Days, validity: '15 days' },
//         { new: true }
//     );

//     if (updatedToken) {
//         res.json({ message: '15-day token updated successfully', token: token15Days });
//     } else {
//         res.status(404).json({ message: 'Company not found' });
//     }
// });

// PATCH API to update JWT token with 15-day validity
router.patch('/updateToken15Days/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const { companyName, mobileNumber } = req.body;

    console.log('Updating token for company ID:', companyId);
    console.log('Company Name:', companyName);
    console.log('Mobile Number:', mobileNumber);

    try {
        // Generate new JWT token with 15-day validity
        const token15Days = jwt.sign(
            { companyName, mobileNumber, validity: '15 days' }, // Payload
            secretKey,                                          // Secret key
            { expiresIn: '15d' }                                // Options
        );

        // Log the generated token to verify
        console.log('Generated Token:', token15Days);

        // Update the token in MongoDB
        const updatedToken = await Token.findOneAndUpdate(
            { _id: companyId },
            { jwtToken: token15Days, validity: '15 days',status: 'active'},
            { new: true }
        );

        if (updatedToken) {
            res.json({ message: '15-day token updated successfully', token: token15Days });
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        console.error('Error updating token:', error);
        res.status(500).json({ message: 'Error updating token', error });
    }
});

// PATCH API to update JWT token with 30-day validity
router.patch('/updateToken30Days/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const { companyName, mobileNumber } = req.body;

    // Generate new JWT token with 30-day validity
    const token30Days = jwt.sign({ companyName, mobileNumber, validity: '30 days' }, secretKey, { expiresIn: '30d' });

    // Update the token in MongoDB
    const updatedToken = await Token.findOneAndUpdate(
        { _id: companyId },
        { jwtToken: token30Days, validity: '30 days', status: 'active' },
        { new: true }
    );

    if (updatedToken) {
        res.json({ message: '30-day token updated successfully', token: token30Days });
    } else {
        res.status(404).json({ message: 'Company not found' });
    }
});

// PATCH API to update JWT token with 365-day validity
router.patch('/updateToken365Days/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const { companyName, mobileNumber } = req.body;

    // Generate new JWT token with 365-day validity
    const token365Days = jwt.sign({ companyName, mobileNumber, validity: '365 days' }, secretKey, { expiresIn: '365d' });

    // Update the token in MongoDB
    const updatedToken = await Token.findOneAndUpdate(
        { _id: companyId },
        { jwtToken: token365Days, validity: '365 days', status: 'active'},
        { new: true }
    );

    if (updatedToken) {
        res.json({ message: '365-day token updated successfully', token: token365Days });
    } else {
        res.status(404).json({ message: 'Company not found' });
    }
});

// // PATCH API to deactivate a JWT token by mobileNumber and jwtToken, and set startDate and endDate
// router.patch('/deactivateTokenByMobileAndToken', async (req, res) => {
//     const { mobileNumber, jwtToken } = req.body;

//     try {
//         // Find the token associated with the mobileNumber and compare the jwtToken
//         const existingToken = await Token.findOne({ mobileNumber, jwtToken, status: 'active' });

//         if (!existingToken) {
//             return res.status(404).json({ message: 'No matching active token found for this mobile number' });
//         }

//         // Calculate the endDate based on the current date and the token's validity
//         const validityDays = parseInt(existingToken.validity.split(' ')[0]);
//         const endDate = moment().add(validityDays - 1, 'days').toDate();

//         // Set the startDate to the current date and deactivate the token
//         const startDate = moment().toDate();
//         existingToken.status = 'inactive';
//         existingToken.startDate = startDate;
//         existingToken.endDate = endDate;

//         // Save the updated token with the new startDate and endDate
//         await existingToken.save();

//         res.json({ message: 'Token deactivated successfully', startDate: startDate, endDate: endDate });
//     } catch (error) {
//         console.error('Error deactivating token:', error);
//         res.status(500).json({ message: 'Error deactivating token', error: error.message });
//     }
// });

// PATCH API to deactivate a JWT token by mobileNumber and jwtToken, and set startDate and endDate
router.patch('/deactivateTokenByMobileAndToken', async (req, res) => {
    const { mobileNumber, jwtToken } = req.body;

    try {
        // Find the token associated with the mobileNumber and compare the jwtToken
        const existingToken = await Token.findOne({ mobileNumber, jwtToken, status: 'active' });

        if (!existingToken) {
            return res.status(404).json({ message: 'No matching active token found for this mobile number' });
        }

        // Calculate the endDate based on the current date and the token's validity
        const validityDays = parseInt(existingToken.validity.split(' ')[0]);
        const endDate = moment().add(validityDays - 1, 'days').toDate();

        // Set the startDate to the current date and deactivate the token
        const startDate = moment().toDate();
        existingToken.status = 'inactive';
        existingToken.startDate = startDate;
        existingToken.endDate = endDate;

        // Save the updated token with the new startDate and endDate
        await existingToken.save();

        // Find and update the Admin or AdminBar with the new token information
        let user = await Admin.findOne({ mobileNumber });

        if (!user) {
            user = await AdminBar.findOne({ mobileNumber });
        }

        if (!user) {
            user = await CounterAdmin.findOne({ mobileNumber });
        }

        if (user) {
            user.jwtToken = jwtToken;
            user.startDate = startDate;
            user.endDate = endDate;
            await user.save();
        } else {
            return res.status(404).json({ message: 'No matching user found for this mobile number' });
        }

        res.json({ message: 'Token deactivated and user updated successfully', startDate: startDate, endDate: endDate });
    } catch (error) {
        console.error('Error deactivating token:', error);
        res.status(500).json({ message: 'Error deactivating token', error: error.message });
    }
});

module.exports = router;