// routes/kot.js

const express = require('express');
const router = express.Router();
const KOT = require('../models/KOT');


router.post('/kotOrder/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { items = [], waiterName, } = req.body;

    const modifiedItems = items.map(item => ({
      name:item.name,
      quantity:item.quantity,
      taste: item.taste || '', // Set the taste information, or default to an empty string
    }));

    const newKOT = new KOT({
      tableId,
      items: modifiedItems,
      waiterName,
    });

    const savedKOT = await newKOT.save();

    res.json(savedKOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get KOT by Table ID
router.get('/kot/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const kot = await KOT.findOne({ tableId }).sort({ createdAt: -1 });
    res.status(200).json(kot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;