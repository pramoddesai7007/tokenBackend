// routes/gstRoutes.js
const express = require('express');
const router = express.Router();
const VAT = require('../models/VAT');

// Create or update GST information
// routes/gstRoutes.js
router.post('/create', async (req, res) => {
    const { vatPercentage } = req.body;

    try {
        // Check if GST entry with the given percentage already exists
        const existingVAT = await VAT.findOne({ vatPercentage });

        if (existingVAT) {
            return res.status(400).json({ error: 'VAT entry with this percentage already exists' });
        }

        // Create a new GST document
        const vatInfo = new VAT({ vatPercentage });
        await vatInfo.save();

        res.status(200).json(vatInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update the GST percentage
router.put('/vat/:id', async (req, res) => {
    const { id } = req.params;
    const { vatPercentage } = req.body;

    try {
        const vatInfo = await VAT.findById(id);

        if (!vatInfo) {
            return res.status(404).json({ error: 'VAT information not found' });
        }

        vatInfo.vatPercentage = vatPercentage;
        await vatInfo.save();

        res.status(200).json(vatInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// routes/gstRoutes.js
router.get('/list', async (req, res) => {
    try {
        const vatList = await VAT.find();
        res.status(200).json(vatList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// routes/gstRoutes.js
router.delete('/vat/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedVat = await VAT.findByIdAndDelete(id);

        if (!deletedVat) {
            return res.status(404).json({ message: 'VAT information not found' });
        }

        res.status(200).json({ message: 'VAT information deleted successfully', deletedVat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
