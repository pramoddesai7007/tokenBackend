const mongoose = require('mongoose');

const dateWiseRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  debit: { type: Number, required: true, min: 0 },
});

const creditBalanceRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  creditBalance: { type: Number, required: true, min: 0 },
  orderNumber: { type: String, required: true }
});

const customerSchema = new mongoose.Schema({
  customerName: {
    type: String,
    // required: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
    // required: true,
  },
  creditBalance: {
    type: Number,
    // default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
 },
  debit: {
    type: Number,
    // default: 0,
  },
  balance: {
    type: Number,
   
  },
  dateWiseRecords: [dateWiseRecordSchema],
  creditBalanceRecords: [creditBalanceRecordSchema],
  // Add more fields as needed
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;