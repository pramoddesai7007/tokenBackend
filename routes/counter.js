const express = require('express');
const CounterCategory = require('../models/Counter');
const Menu = require('../models/Menu');
const router = express.Router();
const MainCategory = require('../models/MainCategory');

router.post('/', async (req, res) => {
  const { countername, menus, mainCategory } = req.body;

  try {
    const newCounterCategory = new CounterCategory({ countername, menus, mainCategory });
    const savedCounterCategory = await newCounterCategory.save();
    res.status(201).json(savedCounterCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing counter category
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { countername, menus, mainCategory } = req.body;

  try {
    const counterCategoryToUpdate = await CounterCategory.findById(id);

    if (!counterCategoryToUpdate) {
      return res.status(404).json({ message: 'Counter category not found' });
    }

    counterCategoryToUpdate.countername = countername !== undefined ? countername : counterCategoryToUpdate.countername;
    counterCategoryToUpdate.menus = menus !== undefined ? menus : counterCategoryToUpdate.menus;
    counterCategoryToUpdate.mainCategory = mainCategory !== undefined ? mainCategory : counterCategoryToUpdate.mainCategory;

    const updatedCounterCategory = await counterCategoryToUpdate.save();
    res.json(updatedCounterCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all counter categories with populated main category
router.get('/', async (req, res) => {
  try {
    const counterCategories = await CounterCategory.find().populate('mainCategory');
    res.json(counterCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single counter category
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const counterCategory = await CounterCategory.findById(id);

    if (!counterCategory) {
      return res.status(404).json({ message: 'Counter category not found' });
    }

    res.json(counterCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a counter category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCounterCategory = await CounterCategory.findByIdAndDelete(id);
    res.json({ message: 'Counter category deleted successfully', deletedCounterCategory });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing counter category by adding menus
router.post('/:counterCategoryId/assignmenus', async (req, res) => {
  const { counterCategoryId } = req.params;
  const { menuIds } = req.body;

  try {
      // Find the CounterCategory by ID
      const counterCategory = await CounterCategory.findById(counterCategoryId);

      if (!counterCategory) {
          return res.status(404).json({ message: 'CounterCategory not found' });
      }

      // Filter out menus already associated with other counter categories
      const existingMenus = await CounterCategory.find({ 'menus._id': { $in: menuIds } });
      const menusToAdd = menuIds.filter(menuId => !existingMenus.some(category => category.menus.some(existingMenu => existingMenu._id.equals(menuId))));

      if (menusToAdd.length === 0) {
          return res.status(400).json({ message: 'Menus are already associated with other counter categories' });
      }

      // Find the menus by their IDs
      const menus = await Menu.find({ _id: { $in: menusToAdd } });

      // Concatenate the existing menus with the selected menus
      counterCategory.menus = [...counterCategory.menus, ...menus.map(menu => ({
          _id: menu._id,
          name: menu.name,
          price: menu.price,
          imageUrl: menu.imageUrl,
      }))];

      // Save the updated CounterCategory
      const updatedCounterCategory = await counterCategory.save();

      res.status(200).json(updatedCounterCategory);
  } catch (error) {
      // Log the error for debugging
      console.error('Error in assignmenus route:', error);

      // Return an appropriate error response
      if (error instanceof mongoose.Error.ValidationError) {
          // Validation error (e.g., invalid data sent by the client)
          res.status(400).json({ message: error.message });
      } else {
          // Internal server error
          res.status(500).json({ message: 'Internal server error' });
      }
  }
});

// Example route handler in your backend
router.post('/:counterCategoryId/assignmaincategory', async (req, res) => {
  const { counterCategoryId } = req.params;
  const { mainCategory } = req.body; // Expecting mainCategory as an object

  try {
    // Find the counter category by ID and update the mainCategory field
    const counterCategory = await CounterCategory.findByIdAndUpdate(
      counterCategoryId,
      { mainCategory },
      { new: true }
    );

    if (!counterCategory) {
      return res.status(404).json({ error: 'Counter category not found' });
    }

    return res.status(200).json(counterCategory);
  } catch (error) {
    console.error('Error assigning main category to counter:', error);
    return res.status(500).json({ error: 'Error assigning main category to counter' });
  }
});


router.get('/:counterCategoryId/menus', async (req, res) => {
  const { counterCategoryId } = req.params;

  try {
    // Find the CounterCategory by ID
    const counterCategory = await CounterCategory.findById(counterCategoryId);

    if (!counterCategory) {
      return res.status(404).json({ message: 'Counter category not found' });
    }

    // Retrieve the menus associated with the counter category
    const menuIds = counterCategory.menus.map(menu => menu._id);
    const menus = await Menu.find({ _id: { $in: menuIds } });

    res.status(200).json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:counterName/mainCategory', async (req, res) => {
  const { counterName } = req.params;

  try {
    // Find the CounterCategory by name
    const counterCategory = await CounterCategory.findOne({ countername: counterName }).populate('mainCategory');

    if (!counterCategory) {
      return res.status(404).json({ message: 'Counter category not found' });
    }

    // The mainCategory field will now contain the populated MainCategory document
    const mainCategory = counterCategory.mainCategory;

    if (!mainCategory) {
      return res.status(404).json({ message: 'Main category not found' });
    }

    res.status(200).json(mainCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:counterCategoryId/removemenus', async (req, res) => {
  const { counterCategoryId } = req.params;
  const { menuIds } = req.body;

  try {
      // Find the MainCategory by ID
      const mainCategory = await CounterCategory.findById(counterCategoryId);

      if (!mainCategory) {
          return res.status(404).json({ message: 'MainCategory not found' });
      }

      // Filter out the menus with the specified IDs
      mainCategory.menus = mainCategory.menus.filter(menu => !menuIds.includes(menu._id.toString()));

      // Save the updated MainCategory
      const updatedMainCategory = await mainCategory.save();

      res.status(200).json(updatedMainCategory);
  } catch (error) {
      console.error('Error removing menus:', error);
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;