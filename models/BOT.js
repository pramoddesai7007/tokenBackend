const mongoose = require('mongoose');

const BOTSchema = new mongoose.Schema({
    tableId: {
        type: String,
        required: true
    },
    itemsWithBarCategory: [{
        name: String,
        quantity: Number,
        price: Number,
        taste: String,
        isCanceled: {
            type: Boolean,
            default: false
        }
    }],
    BOTDate: {
        type: Date,
        default: Date.now // Set as the current Date and Time when the order is saved
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    waiterName: {
        type: String,
    },
    setteled: {
        type: Boolean,
        default: false
    }
});

const BOT = mongoose.model('BOT', BOTSchema);
module.exports = BOT;