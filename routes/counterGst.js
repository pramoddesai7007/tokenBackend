const express = require('express');
const CounterGst = require('../models/CounterGst');
const router = express.Router();

// Create or update GST information
router.post('/create', async (req, res) => {
    const { gstPercentage } = req.body;

    try {
        if (isNaN(gstPercentage) || gstPercentage < 0 || gstPercentage > 100) {
            return res.status(400).json({ error: 'GST percentage must be a number between 0 and 100' });
        }

        const existingGST = await CounterGst.findOne({ gstPercentage });

        if (existingGST) {
            return res.status(400).json({ error: 'GST entry with this percentage already exists' });
        }

        const gstInfo = new CounterGst({ gstPercentage });
        await gstInfo.save();

        res.status(200).json(gstInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update the GST percentage
router.put('/gst/:id', async (req, res) => {
    const { id } = req.params;
    const { gstPercentage } = req.body;

    try {
        if (isNaN(gstPercentage) || gstPercentage < 0 || gstPercentage > 100) {
            return res.status(400).json({ error: 'GST percentage must be a number between 0 and 100' });
        }

        const gstInfo = await CounterGst.findByIdAndUpdate(id, { gstPercentage }, { new: true });

        if (!gstInfo) {
            return res.status(404).json({ error: `GST information with ID ${id} not found` });
        }

        res.status(200).json(gstInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all GST information
router.get('/list', async (req, res) => {
    try {
        const gstList = await CounterGst.find();
        res.status(200).json(gstList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete GST information by ID
router.delete('/gst/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedGst = await CounterGst.findByIdAndDelete(id);

        if (!deletedGst) {
            return res.status(404).json({ error: `GST information with ID ${id} not found` });
        }

        res.status(200).json({ message: 'GST information deleted successfully', deletedGst });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
