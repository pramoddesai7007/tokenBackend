// models/DiningTable.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tableSchema = new Schema({
    tableName: {
        type: String,
        required: true,
        unique: true,
    },
    section: {
        name: {
            type: String,
            required: true,
        },
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Section',
            required: true,
        },
    },
});


const Table = mongoose.model('Table', tableSchema);
module.exports = Table;
