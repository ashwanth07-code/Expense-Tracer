const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');

// Get all expenses for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get monthly expenses summary
router.get('/summary', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const user = await User.findById(req.userId);
    
    // Category wise breakdown
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      total,
      limit: user.monthlyLimit,
      categoryBreakdown,
      count: expenses.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new expense
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = new Expense({
      user: req.userId,
      title,
      amount,
      category,
      date: date || Date.now(),
      description
    });

    await expense.save();

    // Check monthly limit
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const user = await User.findById(req.userId);

    res.status(201).json({
      expense,
      monthlyTotal: total,
      limit: user.monthlyLimit,
      limitExceeded: user.monthlyLimit > 0 && total > user.monthlyLimit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    
    let expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description || expense.description;

    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;