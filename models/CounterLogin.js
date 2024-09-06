const mongoose = require('mongoose')
const { Schema } = mongoose;


const counterAdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String, // New field to store the mobile number
        required: true,
        unique: true
    },
    jwtToken: {
        type: String, // New field to store the JWT token
    },
    startDate: {
        type: Date,
        default: Date.now // This sets the default value of startDate to the current date
    },
    endDate: {
        type: Date, // New field to store the end date of the token
    },
    resetToken: {
        type: String, // This will store the reset token
    },
    resetTokenExpires: {
        type: Date, // This will store the expiration date of the reset token
    },
});


const CounterAdmin = mongoose.model('CounterAdmin', counterAdminSchema)
module.exports = CounterAdmin


