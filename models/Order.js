// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const orderSchema = new mongoose.Schema({

//     tableId: {
//         type: String,
//         required: true
//     },
//     items: [{
//         name: String,
//         price: Number,
//         quantity: Number,
//         taste: String,
//         isCanceled: {
//             type: Boolean,
//             default: false
//         }
//     }],
//     subtotal: {
//         type: Number,
//         required: true
//     },
//     CGST: {
//         type: Number,
//         required: true
//     },
//     SGST: {
//         type: Number,
//         required: true
//     },
//     total: {
//         type: Number,
//         required: true
//     },
//     isTemporary: {
//         type: Boolean,
//         default: true,
//     },
//     orderDate: {
//         type: Date,
//         default: Date.now
//     },
//     acPercentageAmount: {
//         type: Number,
//     },
//     isPrint: {
//         type: Number,
//         default: 0
//     },
//     cashAmount: {
//         type: String,
//     },
//     onlinePaymentAmount: {
//         type: String,
//     },
//     complimentaryAmount: {
//         type: String,
//     },
//     dueAmount: {
//         type: String,
//     },
//     discount: {
//         type: String,
//     },
//     orderNumber: {
//         type: String,
//         unique: true,
//         immutable: true, // Ensures the order number cannot be changed once set
//         // required: true,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     isMerged: {
//         type: Boolean,
//         default: false
//     },
//     destinationTableName: String, // New field to store the destination table name
//     destinationOrderNumber: String,
//     flag: {
//         type: Number,
//         default: 0
//     },
// });


// orderSchema.pre('save', async function (next) {
//     try {
//         // Check if the order number is already set (for updating orders)
//         if (!this.isNew) {
//             return next();
//         }

//         // Get the total count of documents in the collection
//         const totalCount = await this.constructor.countDocuments();

//         // Generate the new order number based on the total count
//         const newOrderNumber = `${totalCount + 1}`;

//         // Set the order number in the document
//         this.orderNumber = newOrderNumber;

//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;






// old order schema 


// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const orderSchema = new mongoose.Schema({
//     tableId: {
//         type: String,
//         required: true
//     },
//     items: [{
//         name: String,
//         price: Number,
//         quantity: Number,
//         taste: String,
//         isCanceled: {
//             type: Boolean,
//             default: false
//         },
//         barCategory: String
//     }],
//     subtotal: {
//         type: Number,
//         required: true
//     },
//     barSubtotal: {
//         type: Number,
//         required: true
//     },
//     VAT: {
//         type: Number,
//         required: true
//     },
//     CGST: {
//         type: Number,
//         required: true
//     },
//     SGST: {
//         type: Number,
//         required: true
//     },
//     total: {
//         type: Number,
//         required: true
//     },
//     grandTotal: {
//         type: Number,
//         required: true
//     },
//     menuTotal: {
//         type: Number,
//         required: true
//     },
//     isTemporary: {
//         type: Boolean,
//         default: true,
//     },
//     orderDate: {
//         type: Date,
//         default: Date.now
//     },
//     acPercentageAmount: {
//         type: Number,
//     },
//     acPercentage: {
//         type: Number,
//     },
//     vatPercentage: {
//         type: Number,
//     },
//     gstPercentage: {
//         type: Number,
//     },

//     isPrint: {
//         type: Number,
//         default: 0
//     },
//     cashAmount: {
//         type: String,
//     },
//     onlinePaymentAmount: {
//         type: String,
//     },
//     complimentaryAmount: {
//         type: String,
//     },
//     dueAmount: {
//         type: String,
//     },
//     discount: {
//         type: String,
//     },
//     orderNumber: {
//         type: String,
//         unique: true,
//         immutable: true, // Ensures the order number cannot be changed once set
//         // required: true,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     isMerged: {
//         type: Boolean,
//         default: false
//     },
//     destinationTableName: String, // New field to store the destination table name
//     destinationOrderNumber: String,
//     flag: {
//         type: Number,
//         default: 0
//     },
// });

// orderSchema.pre('save', async function (next) {
//     try {
//         // Check if the order number is already set (for updating orders)
//         if (!this.isNew) {
//             return next();
//         }

//         // Get the total count of documents in the collection
//         const totalCount = await this.constructor.countDocuments();

//         // Generate the new order number based on the total count
//         const newOrderNumber = `${totalCount + 1}`;

//         // Set the order number in the document
//         this.orderNumber = newOrderNumber;

//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// const Order = mongoose.model('Order', orderSchema);
// module.exports = Order;








// new order schema for liquorStockReport 
// niranjan working 03-06-2024


const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
    tableId: {
        type: String,
        required: true
    },
    items: [{
        name: String,
        price: Number,
        quantity: Number,
        taste: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        isCanceled: {
            type: Boolean,
            default: false
        },
        barCategory: String,
        selectedParentId: String, // Add this line to include selectedParentId
    }],
    waiterName: {
        type: String,
    },
    subtotal: {
        type: Number,
        required: true
    },
    barSubtotal: {
        type: Number,
        required: true
    },
    VAT: {
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
    grandTotal: {
        type: Number,
        required: true
    },
    lastTotal:{
        type:Number
    },
    menuTotal: {
        type: Number,
        required: true
    },
    isTemporary: {
        type: Boolean,
        default: true,
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    acPercentageAmount: {
        type: Number,
    },
    acPercentage: {
        type: Number,
    },
    vatPercentage: {
        type: Number,
    },
    gstPercentage: {
        type: Number,
    },
    isPrint: {
        type: Number,
        default: 0
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
    isMerged: {
        type: Boolean,
        default: false
    },
    destinationTableName: String, // New field to store the destination table name
    destinationOrderNumber: String,
    flag: {
        type: Number,
        default: 0
    },
});

orderSchema.pre('save', async function (next) {
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

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
