const mongoose = require('mongoose');

const barStockOutSchema = new mongoose.Schema({
    waiterName: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    stockQty: {
        type: Number,
        required: true, // Assuming stock quantity is required
    },
    availableQuantity: {
        type: Number, // Assuming available quantity is a number
        required: true, // Assuming available quantity is required
    },
});

const BarStockOut = mongoose.model('BarStockOut', barStockOutSchema);

module.exports = BarStockOut;