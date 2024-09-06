// const mongoose = require('mongoose');

// const vatSchema = new mongoose.Schema({
//   vatPercentage: {
//     type: Number,
//     required: true,
//     unique: true,
//     min: 0,
//     max: 100,
//   },
// });

// const VAT = mongoose.model('VAT', vatSchema);

// module.exports = VAT;


// models/GST.js
const mongoose = require('mongoose');

const vatSchema = new mongoose.Schema({
  vatPercentage: {
    type: Number,
    required: true,
    unique:true,
    min: 0,
    max: 100,
  },
});

const VAT = mongoose.model('VAT', vatSchema);

module.exports = VAT;



