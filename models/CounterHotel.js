const mongoose = require('mongoose');

const counterhotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // Assuming each hotel has a unique email
  },
  contactNo: {
    type: String,
    required: true,
  },
  gstNo: {
    type: String,
    // required: true,
  },
  sacNo: {
    type: String,
    // required: true,
  },
  fssaiNo: {
    type: String,
    // required: true,
  },
  hotelLogo: {
    type: String, // You might want to store the path or URL to the image file
    // required: true,
  },
  qrCode: {
    type: String, // You might want to store the path or URL to the QR code image file
    // required: true,
  },
  gstPercentage: {
    type: Number, // You might want to store the path or URL to the QR code image file
  },

});

const CounterHotel = mongoose.model('CounterHotel', counterhotelSchema);

module.exports = CounterHotel