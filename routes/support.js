require('dotenv').config();
const { Router } = require('express')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken')
const Support = require('../models/Support');


// One time setup to store and create user in Database
// http://localhost:5000/api/auth/support-setup
router.post('/support-setup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the support user already exists
        const existingSupportUser = await Support.findOne({ username });
        if (existingSupportUser) {
            return res.status(400).json({ message: 'Support user with the same username already exists' });
        }

        // Hash the plain password using bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new support user with the hashed password
        const newSupport = new Support({
            username,
            password: hashedPassword,
        });

        // Save the support user to the database
        await newSupport.save();

        return res.status(201).json({ message: 'Support user setup successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// GET all support users
// http://localhost:5000/api/auth/support-users
router.get('/support-users', async (req, res) => {
    try {
        // Retrieve all support users
        const supportUsers = await Support.find();
        
        return res.status(200).json(supportUsers);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE a specific support user by username
// http://localhost:5000/api/auth/support-user/:username
router.delete('/support-user/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Find and delete the support user by username
        const deletedUser = await Support.findOneAndDelete({ username });
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'Support user not found' });
        }

        return res.status(200).json({ message: 'Support user successfully deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router