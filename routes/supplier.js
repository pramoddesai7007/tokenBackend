const express = require('express');
const Supplier = require('../models/Supplier');
const router = express.Router();

// API route to create a new supplier
router.post('/suppliers', async (req, res) => {
    try {
        const newSupplierData = req.body;
        newSupplierData.debit = 0; // Initialize debit to 0
        newSupplierData.credit = 0; // Initialize credit to 0

        const newSupplier = new Supplier(newSupplierData);
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// API route to get all suppliers
router.get('/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to get a specific supplier by ID
// router.get('/suppliers/:id', async (req, res) => {
//     try {
//         const supplier = await Supplier.findById(req.params.id);
//         if (!supplier) {
//             return res.status(404).json({ message: 'Supplier not found' });
//         }
//         res.status(200).json(supplier);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
router.get('/suppliers/:id', async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Calculate balance dynamically based on debits
        const balance = supplier.credit - supplier.debit;

        // Return supplier details with calculated balance
        res.status(200).json({ ...supplier.toObject(), balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to update a specific supplier by ID
router.patch('/suppliers/:id', async (req, res) => {
    try {
        const updatedSupplierData = req.body;

        // Ensure that debit and credit are not overwritten
        delete updatedSupplierData.debit;
        delete updatedSupplierData.credit;

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            updatedSupplierData,
            { new: true }
        );

        if (!updatedSupplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to delete a specific supplier by ID
router.delete('/suppliers/:id', async (req, res) => {
    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!deletedSupplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.status(200).json(deletedSupplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to update supplier's debit balance
router.post('/supplier/debit', async (req, res) => {
    try {
        const { vendorName, amount } = req.body;
        const supplier = await Supplier.findOne({ vendorName });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        supplier.debit += amount;
        await supplier.save();

        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to update supplier's credit balance
router.post('/supplier/credit', async (req, res) => {
    try {
        const { vendorName, amount } = req.body;
        const supplier = await Supplier.findOne({ vendorName });

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        supplier.credit += amount;
        await supplier.save();

        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


  
router.put('/updateBalance/:id', async (req, res) => {
    try {
      const { debit } = req.body;
  
      // Update the debit amount and date-wise records
      const supplier = await Supplier.findByIdAndUpdate(
        req.params.id,
        {
          $inc: { debit: debit },
          $push: { dateWiseRecords: { debit: debit } },
        },
        { new: true }
      );
  
      if (!supplier) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
  
      // Calculate openingBalance based on the updated balance
      const openingBalance = supplier.credit - supplier.debit;
  
      // Update the openingBalance field
      await Supplier.findByIdAndUpdate(req.params.id, { $set: { openingBalance } });
  
      // Fetch the updated supplier
      const updatedSupplier = await Supplier.findById(req.params.id);
  
      res.status(200).json(updatedSupplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;