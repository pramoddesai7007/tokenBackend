const mongoose = require('mongoose');

const purchaseVatSchema = new mongoose.Schema({
  vatPercentage: {
    type: Number,
    required: true,
    unique: true,
    min: 0,
    max: 100,
  },
});

const PurchaseVAT = mongoose.model('PurchaseVAT', purchaseVatSchema);

module.exports = PurchaseVAT;