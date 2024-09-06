
// const mongoose = require('mongoose')
// const { Schema } = mongoose;


// const adminBarSchema = new Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     resetToken: {
//         type: String, // This will store the reset token
//     },
//     resetTokenExpires: {
//         type: Date, // This will store the expiration date of the reset token
//     },
//     isBar: {
//         type: Boolean,
//         default: false
//     },
// });


// const AdminBar = mongoose.model('AdminBar', adminBarSchema)
// module.exports = AdminBar

const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminBarSchema = new Schema({
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
    resetToken: {
        type: String, // This will store the reset token
    },
    resetTokenExpires: {
        type: Date, // This will store the expiration date of the reset token
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
    isBar: {
        type: Boolean,
        default: false
    },
});

// Pre-save middleware to set endDate as startDate plus 15 days
adminBarSchema.pre('save', function(next) {
    if (!this.endDate) {
        // Calculate endDate as 15 days after startDate
        this.endDate = new Date(this.startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    next();
});

const AdminBar = mongoose.model('AdminBar', adminBarSchema);
module.exports = AdminBar;
