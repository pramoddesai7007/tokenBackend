const express = require('express');
const PurchaseVAT = require('../models/PurchaseVAT');
const router = express.Router();



// POST route to create a new VAT entry
router.post('/vat', async (req, res) => {
  try {
    const { vatPercentage } = req.body;

    // Check if VAT percentage already exists
    const existingVAT = await PurchaseVAT.findOne({ vatPercentage });
    if (existingVAT) {
      return res.status(400).json({ error: "VAT percentage already exists" });
    }

    // Create new VAT entry
    const newVAT = new PurchaseVAT({ vatPercentage });
    await newVAT.save();

    res.json(newVAT);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// GET route to retrieve all VAT entries
router.get('/vat', async (req, res) => {
  try {
    const vatEntries = await PurchaseVAT.find();
    res.json(vatEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH route to update a VAT entry by ID
router.patch('/vat/:id', async (req, res) => {
  try {
    const { vatPercentage } = req.body;

    const updatedVAT = await PurchaseVAT.findByIdAndUpdate(req.params.id, { vatPercentage }, { new: true });
    if (!updatedVAT) {
      return res.status(404).json({ error: "VAT entry not found" });
    }

    res.json(updatedVAT);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE route to delete a VAT entry by ID
router.delete('/vat/:id', async (req, res) => {
  try {
    const deletedVAT = await PurchaseVAT.findByIdAndDelete(req.params.id);
    if (!deletedVAT) {
      return res.status(404).json({ error: "VAT entry not found" });
    }

    res.json({ message: "VAT entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;