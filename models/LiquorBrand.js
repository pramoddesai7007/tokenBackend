// // const mongoose = require('mongoose');
// // const { Schema } = mongoose;

// // const liquorBrandSchema = new Schema({

// //     barSubmenuName: {
// //         type: String,

// //     },
// //     pricePer1Bottle: {
// //         type: String,
// //     },
// //     pricePer30ml: {
// //         type: String,

// //     },
// //     pricePer60ml: {
// //         type: String,

// //     },
// //     pricePer90ml: {
// //         type: String,

// //     },
// //     pricePer120ml: {
// //         type: String,

// //     },
// //     pricePer150ml: {
// //         type: String,

// //     },
// //     pricePer180ml: {
// //         type: String,

// //     },
// //     pricePer650ml: {
// //         type: String,

// //     },
// //     pricePer375ml: {
// //         type: String,

// //     },
// //     pricePer750ml: {
// //         type: String,

// //     },
// //     pricePer1000ml: {
// //         type: String,

// //     },
// //     barSubmenuId: {
// //         type: String,
// //     },
// //     stockQty: {
// //         type: Number,
// //         default: 0
// //     },
// //     stockLimit: {
// //         type: String,
// //     },
// //     sizeMl: {
// //         type: String,
// //     },
// //     imageUrl: {
// //         type: String, // Assuming the image will be stored as a URL
// //     },
// //     liquorCategory: {
// //         id: {
// //             type: Schema.Types.ObjectId,
// //             ref: 'LiquorCategory' // Reference to the MainCategory schema
// //         },
// //         name: String
// //     }
// // });

// // const LiquorBrand = mongoose.model('LiquorBrand', liquorBrandSchema);
// // module.exports = LiquorBrand;
// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const liquorBrandSchema = new Schema({
//     barSubmenuName: {
//         type: String,
//     },
//     pricePer1Bottle: {
//         type: String,
//     },
//     pricePer30ml: {
//         type: String,
//     },
//     pricePer60ml: {
//         type: String,
//     },
//     pricePer90ml: {
//         type: String,
//     },
//     pricePer120ml: {
//         type: String,
//     },
//     pricePer150ml: {
//         type: String,
//     },
//     pricePer180ml: {
//         type: String,
//     },
//     pricePer650ml: {
//         type: String,
//     },
//     pricePer375ml: {
//         type: String,
//     },
//     pricePer750ml: {
//         type: String,
//     },
//     pricePer1000ml: {
//         type: String,
//     },
//     barSubmenuId: {
//         type: String,
//     },
//     stockQty: {
//         type: Number,
//         default: 0
//     },
//     stockLimit: {
//         type: String,
//     },
//     sizeMl: {
//         type: String,
//     },
//     barCategory: { // New field for the bar category
//         type: String,
//     },
//     parentMenuId: { // New field for parentMenuId reference
//         type: Schema.Types.ObjectId,
//         ref: 'LiquorBrand' // Reference to the LiquorBrand schema itself
//     },
//     imageUrl: {
//         type: String, // Assuming the image will be stored as a URL
//     },
//     liquorCategory: {
//         id: {
//             type: Schema.Types.ObjectId,
//             ref: 'LiquorCategory' // Reference to the MainCategory schema
//         },
//         name: String
//     }
// });

// const LiquorBrand = mongoose.model('LiquorBrand', liquorBrandSchema);
// module.exports = LiquorBrand;



// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const liquorBrandSchema = new Schema({
//     barSubmenuName: {
//         type: String,
//     },
//     pricePer1Bottle: {
//         type: String,
//     },
//     stockQty: {
//         type: Number,
//         default: 0
//     },
//     parentMenuId: {
//         type: Schema.Types.ObjectId,
//         ref: 'LiquorBrand' // Reference to the same schema for the parent menu
//     },
//     childMenus: [{
//         parentMenuId: {
//             type: Schema.Types.ObjectId,
//             ref: 'LiquorBrand' // Reference to the same schema for the parent menu
//         },
//         barCategory: {
//             type: String
//         },
//         pricePer30ml: {
//             type: String
//         },
//         pricePer60ml: {
//             type: String
//         },
//         pricePer90ml: {
//             type: String
//         },
//         stockQty: {
//             type: Number,
//             default: 0
//         }
//         // Add other fields as needed
//     }],
//     // Add other fields as needed
// });

// const LiquorBrand = mongoose.model('LiquorBrand', liquorBrandSchema);
// module.exports = LiquorBrand;




// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const liquorBrandSchema = new Schema({
//     barSubmenuName: {
//         type: String,
//     },
//     pricePer1Bottle: {
//         type: String,
//     },
//     stockQty: {
//         type: Number,
//         default: 0
//     },
//     barSubmenuId: {
//         type: String,
//     },
//     stockLimit: {
//        type: String,
//     },
//     sizeMl: {
//        type: String,
//     },
//     imageUrl: {
//        type: String, // Assuming the image will be stored as a URL
//     },
//     parentMenuId: {
//         type: Schema.Types.ObjectId,
//         ref: 'LiquorBrand' // Reference to the same schema for the parent menu
//     },
//     childMenus: [{
//         barSubmenuName: {
//             type: String, // Adding barSubmenuName to the childMenus array
//             ref: 'LiquorBrand' // Reference to the parent menu
//         },        
//         parentMenuId: {
//             type: Schema.Types.ObjectId,
//             ref: 'LiquorBrand' // Reference to the same schema for the parent menu
//         },
//         barCategory: {
//             type: String
//         },
//         pricePer30ml: {
//             type: String
//         },
//         pricePer60ml: {
//             type: String
//         },
//         pricePer90ml: {
//             type: String
//         },
//         pricePer120ml: {
//             type: String
//         },
//         pricePer150ml: {
//             type: String
//         },
//         pricePer180ml: {
//             type: String
//         },
//         pricePer375ml: {
//             type: String
//         },
//         pricePer650ml: {
//             type: String
//         },
//         pricePer750ml: {
//             type: String
//         },
//         pricePer1000ml: {
//             type: String
//         },
//         stockQty: {
//             type: Number,
//             default: 0
//         }
//         // Add other fields as needed
//     }],
//     // Add other fields as needed
// });
// const LiquorBrand = mongoose.model('LiquorBrand', liquorBrandSchema);
// module.exports = LiquorBrand;


const mongoose = require('mongoose');
const { Schema } = mongoose;

const liquorBrandSchema = new Schema({
    name: {
        type: String,
    },
    pricePer1Bottle: {
        type: String,
    },
    stockQty: {
        type: Number,
        default: 0
    },
    barSubmenuId: {
        type: String,
    },
    stockLimit: {
        type: String,
    },
    sizeMl: {
        type: String,
    },
    imageUrl: {
        type: String, // Assuming the image will be stored as a URL
    },
    parentMenuId: {
        type: Schema.Types.ObjectId,
        ref: 'LiquorBrand' // Reference to the same schema for the parent menu
    },
    childMenus: [{
        name: {
            type: String, // Adding barSubmenuName to the childMenus array
            ref: 'LiquorBrand' // Reference to the parent menu
        },
        parentMenuId: {
            type: Schema.Types.ObjectId,
            ref: 'LiquorBrand' // Reference to the same schema for the parent menu
        },
        barCategory: {
            type: String
        },
        pricePer: {
            type: Object,
        },
        stockQty: {
            type: Number,
            default: 0
        },
        stockQtyMl: {
            type: Number,
            default: 0
        },
        stockQtyStr: {
            type: String,
            default: ''
        },
        lessStock: {
            type: Number,
            default: 0
        }

        // Add other fields as needed
    }],
    // Add other fields as needed
});

const LiquorBrand = mongoose.model('LiquorBrand', liquorBrandSchema);
module.exports = LiquorBrand;
