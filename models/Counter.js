const mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema({
    countername: {
        type: String,
        required: true,
        unique: true,
    },
    mainCategory: {
        type: {
          id: {
            type: Schema.Types.ObjectId,
            ref: 'MainCategory' // assuming MainCategory is the name of your MainCategory model
          },
          name: String
        }
      },    
    menus: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Menu',
        },
        name: String,
        price: Number,
    }],
    mainName: {
        type: String,
    },
});

const CounterCategory = mongoose.model('CounterCategory', counterSchema);

module.exports = CounterCategory;

