const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Assuming Expense model is in a file named Expense.js

// Get all expenses
router.get('/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get expense by ID
router.get('/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new expense
router.post('/expenses', async (req, res) => {
  const { expense } = req.body;

  try {
    const newExpense = new Expense({ expense });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update expense by ID
router.patch('/expenses/:id', async (req, res) => {
  const { expense } = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { expense },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete expense by ID
router.delete('/expenses/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(deletedExpense);
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;