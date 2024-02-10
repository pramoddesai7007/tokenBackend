// routes/item.js

const express = require('express');
const Item = require('../models/Item');
const router = express.Router();


router.post('/items', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/items/quantity', async (req, res) => {
  const { productName } = req.query;
  try {
    const item = await Item.findOne({ itemName: productName });
    if (item) {
      const { stockQty, unit } = item;
      res.json({ availableQuantity: stockQty, unit: unit });
    } else {
      res.json({ availableQuantity: 0, unit: '' }); // Adjust accordingly if item not found
    }
  } catch (error) {
    console.error('Error getting available quantity and unit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/items/updateQuantity', async (req, res) => {
  try {
    const { productName, stockQty } = req.body;

    // Find the item by name
    const item = await Item.findOne({ itemName: productName });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update available quantity
    item.stockQty -= stockQty;
    await item.save();

    res.status(200).json({ message: 'Available quantity updated successfully.' });
  } catch (error) {
    console.error('Error updating available quantity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.delete('/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/items/remainingQuantity', async (req, res) => {
  try {
    const items = await Item.find();
    
    // Calculate remaining quantity for each item
    const remainingQuantities = items.map(item => ({
      itemName: item.itemName,
      remainingQuantity: item.stockQty,
      unit: item.unit
    }));

    res.status(200).json(remainingQuantities);
  } catch (error) {
    console.error('Error getting remaining quantities:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
