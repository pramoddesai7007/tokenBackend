const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new mongoose.Schema({

    items: [{
        name: String,
        price: Number,
        quantity: Number,
        taste: String,
        isCanceled: {
            type: Boolean,
            default: false
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    CGST: {
        type: Number,
        required: true
    },
    SGST: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    acPercentageAmount: {
        type: Number,
    },

    cashAmount: {
        type: String,
    },
    onlinePaymentAmount: {
        type: String,
    },
    complimentaryAmount: {
        type: String,
    },
    dueAmount: {
        type: String,
    },
    discount: {
        type: String,
    },
    orderNumber: {
        type: String,
        unique: true,
        immutable: true, // Ensures the order number cannot be changed once set
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


couponSchema.pre('save', async function (next) {
    try {
        // Check if the order number is already set (for updating orders)
        if (!this.isNew) {
            return next();
        }

        // Get the total count of documents in the collection
        const totalCount = await this.constructor.countDocuments();

        // Generate the new order number based on the total count
        const newOrderNumber = `${totalCount + 1}`;

        // Set the order number in the document
        this.orderNumber = newOrderNumber;

        next();
    } catch (error) {
        next(error);
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
