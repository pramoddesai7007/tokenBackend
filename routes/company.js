const express = require('express');
const router = express.Router();
const Company = require('../models/Company'); // Assuming the Company model is in a file named Company.js
const { v4: uuidv4 } = require('uuid'); // To generate unique keys

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get company by ID
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new company
router.post('/companies', async (req, res) => {
  const { name, mobile, address } = req.body;

  try {
    const newCompany = new Company({
      name,
      mobile,
      address,
      key15: uuidv4(),     // Generate unique key for key15
      key1month: uuidv4(), // Generate unique key for key1month
      key1year: uuidv4()   // Generate unique key for key1year
    });

    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Function to generate unique keys
const generateUniqueKey = async (keyField) => {
    let uniqueKey;
    let isUnique = false;
  
    while (!isUnique) {
      uniqueKey = uuidv4();
      const existingCompany = await Company.findOne({ [keyField]: uniqueKey });
      if (!existingCompany) {
        isUnique = true;
      }
    }
  
    return uniqueKey;
  };
  
  // Update or add keys for an existing company
  router.patch('/companies/:id/generate-keys', async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);
  
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // Generate new unique keys
      const key15 = await generateUniqueKey('key15');
      const key1month = await generateUniqueKey('key1month');
      const key1year = await generateUniqueKey('key1year');
  
      // Update the company with new keys
      company.key15 = key15;
      company.key1month = key1month;
      company.key1year = key1year;
  
      const updatedCompany = await company.save();
      res.json(updatedCompany);
    } catch (error) {
      console.error('Error updating company keys:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Update company by ID
router.patch('/companies/:id', async (req, res) => {
  const { name, mobile, address } = req.body;

  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { name, mobile, address },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete company by ID
router.delete('/companies/:id', async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);

    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(deletedCompany);
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;