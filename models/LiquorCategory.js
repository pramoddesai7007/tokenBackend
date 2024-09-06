const mongoose = require('mongoose');
const { Schema } = mongoose;

const liquorCategorySchema = new mongoose.Schema({
    liquorCategory: {
        type: String,
        required: true
    },
    brands: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'LiquorBrand',
        },
        name: String,
        prices: [{
            name:String,
            barCategory: String,
            price: String,
            stockQty: Number,
            stockQtyMl:Number,
            stockQtyStr: String,
        }],
    }],
});

const LiquorCategory = mongoose.model('LiquorCategory', liquorCategorySchema);

module.exports = LiquorCategory;