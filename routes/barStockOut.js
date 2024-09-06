// routes/stockOutwardRoutes.js
const express = require('express');
const BarStockOut = require('../models/BarStockOut');
const LiquorBrand = require('../models/LiquorBrand');

const router = express.Router();


router.post('/stockOut/addItems', async (req, res) => {
    try {
        const { waiterName, productName, stockQty,availableQuantity } = req.body;

        // Validate the inputs if needed

        // Assuming you have a StockOutward model, you can save the entry to the database
        const stockOutwardEntry = new BarStockOut({
            waiterName,
            productName,
            stockQty,
            availableQuantity,
            date: new Date(),
        });

        await stockOutwardEntry.save();

        res.status(201).json({ message: 'Items added to stock outward entries successfully.' });
    } catch (error) {
        console.error('Error adding items to stock outward entries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// // Get list of stock outward entries
// router.get('/stockOut', async (req, res) => {
//     try {
//         const stockOutwardList = await BarStockOut.find();
//         res.json(stockOutwardList);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


router.get("/purchase/childMenuStockQty", async (req, res) => {
    try {
        const name = req.query.name; // Get child menu name from query parameter
        
        // Find the liquor brand document containing the child menu with the specified name
        const liquorBrand = await LiquorBrand.findOne({ 'childMenus.name': { $regex: new RegExp("^" + name.toLowerCase(), "i") } });
        
      
        if (!liquorBrand) {
            return res.status(404).json({ error: "Child menu not found" });
        }
        
        // Find the child menu within the childMenus array by name
        const childMenu = liquorBrand.childMenus.find(menu => menu.name.toLowerCase() === name.toLowerCase());
        
        res.json({ stockQty: childMenu.stockQty });
   
         // Return stock quantity of the child menu
    } catch (error) {
        console.error("Error fetching child menu stock quantity:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.post('/barStockOut', async (req, res) => {
    const { parentMenuId, requiredQuantity } = req.body;

    try {
        // Find the LiquorBrand document containing the child menu with the specified parentMenuId
        const liquorBrand = await LiquorBrand.findOne({ "childMenus.parentMenuId": parentMenuId });

        if (!liquorBrand) {
            return res.status(404).json({ message: 'Parent menu not found' });
        }

        // Find the specific child menu within the childMenus array
        const childMenu = liquorBrand.childMenus.find(menu => menu.parentMenuId.toString() === parentMenuId);

        if (!childMenu) {
            return res.status(404).json({ message: 'Child menu not found' });
        }

        // Calculate the new stock quantity
        const updatedStockQty = childMenu.stockQty - requiredQuantity;

        if (updatedStockQty < 0) {
            return res.status(400).json({ message: 'Insufficient stock quantity' });
        }

        // Update the stockQty of the specific child menu
        await LiquorBrand.updateOne(
            { "childMenus._id": childMenu._id },
            { $set: { "childMenus.$.stockQty": updatedStockQty } }
        );

        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error('Error updating stock quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/getParentMenuId', async (req, res) => {
    try {
        const productName = req.query.productName;

        // Find the liquor brand document containing the child menu with the specified name
        const liquorBrand = await LiquorBrand.findOne({ 'childMenus.name': productName });

        if (!liquorBrand) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the child menu within the childMenus array by name
        const childMenu = liquorBrand.childMenus.find(menu => menu.name === productName);

        if (!childMenu) {
            return res.status(404).json({ error: 'Child menu not found' });
        }

        res.json({ parentMenuId: childMenu.parentMenuId });
    } catch (error) {
        console.error('Error fetching parent menu ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;