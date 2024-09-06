// const mongoose = require('mongoose');

// const barPurchaseSchema = new mongoose.Schema({
//     date: {
//         type: Date
//     },
//     dueDate: {
//         type: Date,
//         default: function() {
//             // Calculate due date 25 days after the current date
//             const currentDate = new Date();
//             const dueDate = new Date(currentDate.setDate(currentDate.getDate() + 25));
//             return dueDate;
//         }
//     },
//     tpDate: {
//         type: Date
//     },
//     tpNo: {
//         type: String
//     },
//     billNo: {
//         type: String,
//         // required: true,
//     },
//     vendorName: {
//         type: String,
//         // required: true,
//     },
//     items: [
//         {
//             name: {
//                 type: String,
//                 required: true,
//             },
//             quantity: {
//                 type: Number,
//                 required: true,
//             },
//             stockQty: {
//                 type: Number,
//                 default: 0
//             },
//             unit: {
//                 type: String,
//                 required: true,
//             },
//             pricePerQty: {
//                 type: Number,
//                 required: true,
//             },
//             vatAmount: {
//                 type: String
//             },
//             salePrice: {
//                 type: Number
//             },
//             mrp: {
//                 type: Number
//             },
//             cases: {
//                 type: Number
//             },
//             size: {
//                 type: String
//             },
//             purchasePrice: {
//                 type: Number
//             },
//             bottlePrice: {
//                 type: Number
//             }
//         }
//     ],
//     subtotal: {
//         type: Number,
//         required: true,
//     },
//     frightAmount: {
//         type: Number,
//         // required: true,
//     },
//     handleAmount: {
//         type: Number,
//     },
//     tcs: {
//         type: Number,
//     },
//     vat: {
//         type: Number
//     },
//     vatAmount: {
//         type: Number
//     },
//     paidAmount: {
//         type: Number,
//         required: true,
//     },
//     discount: {
//         type: Number,
//     },
//     balance: {
//         type: Number,
//     },
// });

// const BarPurchase = mongoose.model('BarPurchase', barPurchaseSchema);

// module.exports = BarPurchase;



// old barPurchase schema 


// const mongoose = require('mongoose');

// const barPurchaseSchema = new mongoose.Schema({
//     date: {
//         type: Date
//     },
//     dueDate: {
//         type: Date,
//         default: function() {
//             // Calculate due date 25 days after the current date
//             const currentDate = new Date();
//             const dueDate = new Date(currentDate.setDate(currentDate.getDate() + 25));
//             return dueDate;
//         }
//     },
//     tpDate: {
//         type: Date
//     },
//     tpNo: {
//         type: String
//     },
//     billNo: {
//         type: String,
//         // required: true,
//     },
//     vendorName: {
//         type: String,
//         // required: true,
//     },
//     items: [
//         {
//             name: {
//                 type: String,
//                 required: true,
//             },
//             quantity: {
//                 type: Number,
//                 required: true,
//             },
//             stockQty: {
//                 type: Number,
//                 default: 0
//             },
//             stockQtyMl: {
//                 type: Number,
//                 default: 0
//             },
            
//             unit: {
//                 type: String,
//                 required: true,
//             },
//             pricePerQty: {
//                 type: Number,
//                 required: true,
//             },
//             vatAmount: {
//                 type: String
//             },
//             salePrice: {
//                 type: Number
//             },
//             mrp: {
//                 type: Number
//             },
//             cases: {
//                 type: Number
//             },
//             size: {
//                 type: String
//             },
//             purchasePrice: {
//                 type: Number
//             },
//             bottlePrice: {
//                 type: Number
//             }
//         }
//     ],
//     subtotal: {
//         type: Number,
//         required: true,
//     },
//     frightAmount: {
//         type: Number,
//         // required: true,
//     },
//     handleAmount: {
//         type: Number,
//     },
//     grandTotal: {
//         type: Number,
//     },
//     tcs: {
//         type: Number,
//     },
//     vat: {
//         type: Number
//     },
//     vatAmount: {
//         type: Number
//     },
//     paidAmount: {
//         type: Number,
//         required: true,
//     },
//     discount: {
//         type: Number,
//     },
//     balance: {
//         type: Number,
//     },
// });

// const BarPurchase = mongoose.model('BarPurchase', barPurchaseSchema);

// module.exports = BarPurchase;






// new barPurchase schema for liquorStockReport 
// niranjan working 14-06-2024


const mongoose = require('mongoose');

const barPurchaseSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        default: function() {
            // Calculate due date 25 days after the current date without changing the system time
            const currentDate = new Date();
            return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
        }
    },
    tpDate: {
        type: Date
    },
    tpNo: {
        type: String
    },
    batchNo: {
        type: String
    },
    billNo: {
        type: String,
        // required: true,
    },
    vendorName: {
        type: String,
        // required: true,
    },
    items: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            stockQty: {
                type: Number,
                default: 0
            },
            stockQtyMl: {
                type: Number,
                default: 0
            },
            unit: {
                type: String,
                required: true,
            },
            pricePerQty: {
                type: Number,
                required: true,
            },
            vatAmount: {
                type: String
            },
            salePrice: {
                type: Number
            },
            mrp: {
                type: Number
            },
            cases: {
                type: Number
            },
            size: {
                type: String
            },
            purchasePrice: {
                type: Number
            },
            bottlePrice: {
                type: Number
            },
        },
    ],
    subtotal: {
        type: Number,
        required: true,
    },
    frightAmount: {
        type: Number,
        // required: true,
    },
    handleAmount: {
        type: Number,
    },
    grandTotal: {
        type: Number,
    },
    tcs: {
        type: Number,
    },
    vat: {
        type: Number
    },
    vatAmount: {
        type: Number
    },
    paidAmount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
    },
    balance: {
        type: Number,
    },
});

const BarPurchase = mongoose.model('BarPurchase', barPurchaseSchema);

module.exports = BarPurchase;