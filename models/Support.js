const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String, // This will store the reset token
    },
    resetTokenExpires: {
        type: Date, // This will store the expiration date of the reset token
    },
});

const Support = mongoose.model('Support', supportSchema);
module.exports = Support;