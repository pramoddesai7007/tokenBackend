// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const LiquorBrand = require('../models/LiquorBrand');
const LiquorCategory = require('../models/LiquorCategory');
const BarPurchase = require('../models/BarPurchase');
const Order = require('../models/Order');
const { upload } = require('../multerConfig');
const router = express.Router();
const xlsx = require('xlsx'); // excel module
const path = require('path');
const fs = require('fs').promises; // Using the promise-based version of fs



router.post('/:liquorCategoryId/assignmenus', async (req, res) => {
    const { liquorCategoryId } = req.params;
    const { menuIds } = req.body;

    try {
        // Find the LiquorCategory by ID
        const liquorCategory = await LiquorCategory.findById(liquorCategoryId);

        if (!liquorCategory) {
            return res.status(404).json({ message: 'LiquorCategory not found' });
        }

        // Fetch existing brands associated with all liquor categories
        const existingBrands = await LiquorCategory.find({}, { brands: 1 });

        // Flatten the existing brands array
        const existingBrandIds = existingBrands.reduce((acc, cur) => [...acc, ...cur.brands.map(brand => brand._id.toString())], []);

        // Filter out menuIds already associated with any liquor category
        const newBrandIdsToAdd = menuIds.filter(menuId => !existingBrandIds.includes(menuId));

        if (newBrandIdsToAdd.length === 0) {
            return res.status(400).json({ message: 'Brands are already associated with other liquor categories' });
        }

        // Find the brands by their IDs and populate name and prices
        const brandsToAdd = await LiquorBrand.find({ _id: { $in: newBrandIdsToAdd } });

        // Construct an array of brand objects with name, ID, and prices
        const brandsWithPrices = brandsToAdd.map(brand => {
            const brandWithPrices = {
                _id: brand._id,
                name: brand.name,
                prices: brand.childMenus.map(menu => ({
                    name: menu.name, barCategory: menu.barCategory, price: menu.pricePer[`pricePer${menu.barCategory}`], stockQty: menu.stockQty,
                    stockQtyStr: menu.stockQtyStr,
                    stockQtyMl: menu.stockQtyMl
                }))
            };
            return brandWithPrices;
        });

        // Merge existing brands with new brands
        const mergedBrands = [...liquorCategory.brands, ...brandsWithPrices];

        // Update the brands array in the liquorCategory
        liquorCategory.brands = mergedBrands;

        // Save the updated LiquorCategory
        const updatedLiquorCategory = await liquorCategory.save();

        res.status(200).json(updatedLiquorCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// router.post('/barSubmenu', upload.single('image'), async (req, res) => {
//     const { name, barSubmenuId, lessStock, liquorCategory, ...prices } = req.body;

//     try {
//         // Create the parent menu
//         const parentMenu = new LiquorBrand({
//             name,
//             // pricePer1Bottle: prices.pricePer1Bottle,
//             stockQty: 0, // Assuming stockQty default value is 0
//             childMenus: [] // Initialize childMenus as an empty array
//         });

//         // Save the parent menu
//         const savedParentMenu = await parentMenu.save();

//         // Add child menus to the parent menu
//         const childMenus = [];

//         for (const [key, value] of Object.entries(prices)) {
//             if (key.startsWith("pricePer")) {
//                 const quantity = key.replace("pricePer", "");
//                 const pricePerObj = {};
//                 pricePerObj[`pricePer${quantity}`] = parseFloat(value); // Convert value to number
//                 childMenus.push({
//                     name: `${name} ${quantity}`, // Use 'barSubmenuName' directly
//                     barCategory: quantity,
//                     pricePer: pricePerObj,
//                     stockQty: 0,
//                     lessStock: Number(lessStock),
//                     parentMenuId: savedParentMenu._id,
//                 });
//             }
//         }

//         // Update the parent menu with child menus
//         await LiquorBrand.findByIdAndUpdate(savedParentMenu._id, { $push: { childMenus } });
//         console.log(LiquorBrand)
//         res.status(201).json({ message: 'Parent menu and child menus created successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// run well
// router.post('/barSubmenu', upload.single('image'), async (req, res) => {
//     const { name, barSubmenuId, liquorCategory, lessStockData, ...prices } = req.body;

//     try {
//         // Create the parent menu
//         const parentMenu = new LiquorBrand({
//             name,
//             stockQty: 0, // Assuming stockQty default value is 0
//             childMenus: [] // Initialize childMenus as an empty array
//         });

//         // Save the parent menu
//         const savedParentMenu = await parentMenu.save();

//         // Add child menus to the parent menu
//         const childMenus = [];

//         for (const [key, value] of Object.entries(prices)) {
//             if (key.startsWith("pricePer")) {
//                 const quantity = key.replace("pricePer", "");
//                 const pricePerObj = {};
//                 pricePerObj[`pricePer${quantity}`] = parseFloat(value) || 0; // Convert value to number
//                 childMenus.push({
//                     name: `${name} ${quantity}`, // Use 'barSubmenuName' directly
//                     barCategory: quantity,
//                     pricePer: pricePerObj,
//                     stockQty: 0,
//                     lessStock: lessStockData[quantity] ? Number(lessStockData[quantity]) : 0, // Use lessStock from lessStockData
//                     parentMenuId: savedParentMenu._id,
//                 });
//             }
//         }

//         // Update the parent menu with child menus
//         await LiquorBrand.findByIdAndUpdate(savedParentMenu._id, { $push: { childMenus } });
//         console.log(LiquorBrand)
//         res.status(201).json({ message: 'Parent menu and child menus created successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// router.post('/barSubmenu', upload.single('image'), async (req, res) => {
//     try {
//         const { name, barSubmenuId, liquorCategory, lessStockData = {}, barCategories: barCategoriesJSON, ...prices } = req.body;
//         const barCategories = JSON.parse(barCategoriesJSON || '[]'); // Parse barCategories safely

//         if (!Array.isArray(barCategories)) {
//             throw new Error('Invalid barCategories format.');
//         }

//         // Create the parent menu
//         const parentMenu = new LiquorBrand({
//             name,
//             stockQty: 0, // Assuming stockQty default value is 0
//             childMenus: [] // Initialize childMenus as an empty array
//         });

//         // Save the parent menu
//         const savedParentMenu = await parentMenu.save();

//         // Add child menus to the parent menu
//         const childMenus = [];

//         barCategories.forEach((category) => {
//             const priceKey = `pricePer${category}`;
//             const priceValue = prices[priceKey] || 0; // Default to 0 if price is not provided
//             const lessStockValue = lessStockData[category] ? Number(lessStockData[category]) : 0; // Default to 0 if lessStock is not provided

//             const pricePerObj = {};
//             pricePerObj[priceKey] = parseFloat(priceValue) || 0; // Ensure the value is a number

//             childMenus.push({
//                 name: `${name} ${category}`,
//                 barCategory: category,
//                 pricePer: pricePerObj,
//                 stockQty: 0,
//                 lessStock: lessStockValue,
//                 parentMenuId: savedParentMenu._id,
//             });
//         });

//         // Update the parent menu with child menus
//         await LiquorBrand.findByIdAndUpdate(savedParentMenu._id, { $push: { childMenus: { $each: childMenus } } });

//         res.status(201).json({ message: 'Parent menu and child menus created successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


router.post('/barSubmenu', upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            barSubmenuId,
            liquorCategory,
            lessStockData: lessStockDataJSON,
            barCategories: barCategoriesJSON,
            ...prices
        } = req.body;

        const barCategories = JSON.parse(barCategoriesJSON || '[]'); // Parse barCategories safely
        const lessStockData = JSON.parse(lessStockDataJSON || '{}'); // Parse lessStockData safely

        if (!Array.isArray(barCategories)) {
            throw new Error('Invalid barCategories format.');
        }

        // Find if the parent menu already exists
        let parentMenu = await LiquorBrand.findOne({ name });

        if (!parentMenu) {
            // If parent menu doesn't exist, create a new one
            parentMenu = new LiquorBrand({
                name,
                stockQty: 0,
                childMenus: []
            });
        }

        const childMenus = [];

        barCategories.forEach((category) => {
            const priceKey = `pricePer${category}`;
            const priceValue = prices[priceKey] || 0; // Default to 0 if price is not provided
            const lessStockValue = lessStockData[category] ? Number(lessStockData[category]) : 0; // Default to 0 if lessStock is not provided

            const pricePerObj = {};
            pricePerObj[priceKey] = parseFloat(priceValue) || 0; // Ensure the value is a number

            childMenus.push({
                name: `${name} ${category}`,
                barCategory: category,
                pricePer: pricePerObj,
                stockQty: 0,
                lessStock: lessStockValue,
                parentMenuId: parentMenu._id,
            });
        });

        // Assign child menus to the parent menu
        parentMenu.childMenus = childMenus;

        // Save the parent menu and its child menus
        await parentMenu.save();

        res.status(201).json({ message: 'Parent menu and child menus created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});




router.get('/:liquorCategoryId', async (req, res) => {
    const { liquorCategoryId } = req.params;

    try {
        // Find the LiquorCategory by ID
        const liquorCategory = await LiquorCategory.findById(liquorCategoryId);

        if (!liquorCategory) {
            return res.status(404).json({ message: 'LiquorCategory not found' });
        }

        console.log(liquorCategory)
        res.status(200).json(liquorCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all bar submenus
// router.get('/barSubmenu/list', async (req, res) => {
//     try {
//         const barSubmenus = await LiquorBrand.find();
//         res.json(barSubmenus);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });



router.get('/barSubmenu/list', async (req, res) => {
    try {
        const barSubmenus = await LiquorBrand.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    stockQty: 1,
                    parentMenuId: 1,
                    childMenus: {
                        $map: {
                            input: "$childMenus",
                            as: "childMenu",
                            in: {
                                _id: "$$childMenu._id", // Include the _id field
                                barCategory: "$$childMenu.barCategory",
                                name: "$$childMenu.name",
                                pricePer: "$$childMenu.pricePer",
                                stockQty: "$$childMenu.stockQty",
                                stockQtyMl: "$$childMenu.stockQtyMl",
                                stockQtyStr: "$$childMenu.stockQtyStr",
                                lessStock: "$$childMenu.lessStock",
                            }
                        }
                    }
                }
            }
        ]);
        res.json(barSubmenus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Edit a bar submenu by ID
// router.put('/barSubmenu/:id', async (req, res) => {
//     try {
//         const updatedBarSubmenu = await LiquorBrand.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json(updatedBarSubmenu);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });


// router.put('/barSubmenu/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, barSubmenuId, liquorCategory, ...prices } = req.body;

//     try {
//         // Find the existing parent menu
//         const parentMenu = await LiquorBrand.findById(id);
//         if (!parentMenu) {
//             return res.status(404).json({ message: 'Parent menu not found' });
//         }

//         console.log(parentMenu)
//         // Update parent menu fields
//         parentMenu.name = name;
//         // Update other fields if necessary

//         // Create or update child menus
//         const childMenus = [];

//         for (const [key, value] of Object.entries(prices)) {
//             if (key.startsWith("pricePer")) {
//                 const quantity = key.replace("pricePer", "");
//                 const pricePerObj = {};
//                 pricePerObj[`pricePer${quantity}`] = parseFloat(value); // Convert value to number

//                 // Find the existing child menu
//                 let childMenu = parentMenu.childMenus.find(cm => cm.barCategory === quantity);

//                 if (childMenu) {
//                     // Update the existing child menu
//                     childMenu.pricePer = pricePerObj;
//                 } else {
//                     // Create a new child menu
//                     childMenu = {
//                         name: `${name} ${quantity}`, // Use 'name' directly
//                         barCategory: quantity,
//                         pricePer: pricePerObj,
//                         stockQty: 0,
//                         parentMenuId: parentMenu._id
//                     };
//                     parentMenu.childMenus.push(childMenu);
//                 }
//             }
//         }

//         // Save the updated parent menu
//         await parentMenu.save();

//         res.status(200).json({ message: 'Parent menu and child menus updated successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// router.put('/barSubmenu/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, ...prices } = req.body;

//     try {
//         // Find the existing parent menu
//         const parentMenu = await LiquorBrand.findById(id);
//         if (!parentMenu) {
//             return res.status(404).json({ message: 'Parent menu not found' });
//         }

//         // Update parent menu fields
//         if (name) {
//             parentMenu.name = name;
//         }
//         // Update other fields if necessary

//         // Update or create child menus
//         for (const [key, value] of Object.entries(prices)) {
//             if (key.startsWith("pricePer")) {
//                 const quantity = key.replace("pricePer", "");

//                 // Find the existing child menu
//                 let childMenu = parentMenu.childMenus.find(cm => cm.barCategory === quantity);

//                 if (childMenu) {
//                     // Update the existing child menu's pricePer object
//                     childMenu.pricePer = { [`pricePer${quantity}`]: parseFloat(value) };
//                 } else {
//                     // Create a new child menu
//                     childMenu = {
//                         name: `${parentMenu.name} ${quantity}`,
//                         barCategory: quantity,
//                         pricePer: { [`pricePer${quantity}`]: parseFloat(value) },
//                         stockQty: 0,
//                         parentMenuId: parentMenu._id
//                     };
//                     parentMenu.childMenus.push(childMenu);
//                 }
//             }
//         }

//         // Save the updated parent menu
//         await parentMenu.save();

//         res.status(200).json({ message: 'Parent menu and child menus updated successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// router.put('/barSubmenu/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, childMenus } = req.body;

//     try {
//         // Find the existing parent menu
//         const parentMenu = await LiquorBrand.findById(id);
//         if (!parentMenu) {
//             return res.status(404).json({ message: 'Parent menu not found' });
//         }

//         // Update parent menu fields
//         if (name) {
//             parentMenu.name = name;
//         }

//         // Update child menus
//         if (childMenus && childMenus.length > 0) {
//             parentMenu.childMenus = parentMenu.childMenus.map(existingChildMenu => {
//                 const updatedChildMenu = childMenus.find(
//                     c => c._id.toString() === existingChildMenu._id.toString()
//                 );

//                 if (updatedChildMenu) {
//                     // Update each field in the existing child menu with the new values
//                     existingChildMenu.name = updatedChildMenu.name;
//                     existingChildMenu.barCategory = updatedChildMenu.barCategory;
//                     existingChildMenu.pricePer = updatedChildMenu.pricePer;
//                     // existingChildMenu.stockQty = updatedChildMenu.stockQty;
//                     // existingChildMenu.stockQtyMl = updatedChildMenu.stockQtyMl;
//                     // existingChildMenu.stockQtyStr = updatedChildMenu.stockQtyStr;
//                 }

//                 return existingChildMenu;
//             });
//         }

//         // Save the updated parent menu
//         await parentMenu.save();

//         res.status(200).json({ message: 'Parent menu and child menus updated successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


// router.put('/barSubmenu/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, childMenus } = req.body;

//     try {
//         // Find the existing parent menu
//         const parentMenu = await LiquorBrand.findById(id);
//         if (!parentMenu) {
//             return res.status(404).json({ message: 'Parent menu not found' });
//         }

//         // Update parent menu fields
//         if (name) {
//             parentMenu.name = name;
//         }

//         // Update child menus
//         if (childMenus && childMenus.length > 0) {
//             parentMenu.childMenus = parentMenu.childMenus.map(existingChildMenu => {
//                 const updatedChildMenu = childMenus.find(
//                     c => c._id.toString() === existingChildMenu._id.toString()
//                 );

//                 if (updatedChildMenu) {
//                     // Update each field in the existing child menu with the new values
//                     existingChildMenu.name = updatedChildMenu.name;
//                     existingChildMenu.barCategory = updatedChildMenu.barCategory;
//                     existingChildMenu.pricePer = updatedChildMenu.pricePer;
//                 }

//                 return existingChildMenu;
//             });
//         }

//         // Save the updated parent menu
//         await parentMenu.save();

//         // Fetch associated liquorCategory and update its price fields
//         const liquorCategory = await LiquorCategory.findOne({ brands: parentMenu._id });
//         if (liquorCategory) {
//             // Find and update the price field in the prices array
//             const brandIndex = liquorCategory.brands.findIndex(b => b._id.equals(parentMenu._id));
//             if (brandIndex !== -1) {
//                 const priceIndex = liquorCategory.brands[brandIndex].prices.findIndex(p =>
//                     p.name === "Johny Walker Black Lable  180ml" && p.barCategory === "180ml"
//                 );
//                 if (priceIndex !== -1) {
//                     liquorCategory.brands[brandIndex].prices[priceIndex].price = "800"; // Update the price here
//                 }
//             }

//             // Save the updated liquorCategory
//             await liquorCategory.save();
//         }

//         res.status(200).json({ message: 'Parent menu and child menus updated successfully' });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });



router.put('/barSubmenu/:id', async (req, res) => {
    const { id } = req.params;
    const { name, childMenus } = req.body;

    try {
        // Find the existing parent menu
        const parentMenu = await LiquorBrand.findById(id);
        if (!parentMenu) {
            return res.status(404).json({ message: 'Parent menu not found' });
        }

        console.log('Found parent menu:', JSON.stringify(parentMenu, null, 2));
        console.log('Received child menus:', JSON.stringify(childMenus, null, 2));

        // Update parent menu fields
        if (name) {
            parentMenu.name = name;
        }

        // Update child menus if provided
        if (childMenus && Array.isArray(childMenus)) {
            parentMenu.childMenus = parentMenu.childMenus.map(existingChildMenu => {
                const updatedChildMenu = childMenus.find(c => c._id.toString() === existingChildMenu._id.toString());
                if (updatedChildMenu) {
                    return {
                        ...existingChildMenu.toObject(),
                        ...updatedChildMenu,
                    };
                }
                return existingChildMenu;
            });
        }

        console.log('Updated parent menu:', JSON.stringify(parentMenu, null, 2));

        // Save the updated parent menu
        await parentMenu.save();

        // Fetch associated liquorCategory and update its price fields
        const liquorCategory = await LiquorCategory.findOne({ 'brands._id': id });
        if (liquorCategory) {
            console.log('Found liquorCategory:', JSON.stringify(liquorCategory, null, 2));

            liquorCategory.brands = liquorCategory.brands.map(brand => {
                if (brand._id.toString() === id) {
                    console.log('Found brand to update:', JSON.stringify(brand, null, 2));

                    // Update the prices array of the found brand
                    brand.prices = brand.prices.map(priceItem => {
                        console.log('Checking price item:', JSON.stringify(priceItem, null, 2));

                        const updatedPriceItem = childMenus.find(
                            childMenu => childMenu.name === priceItem.name && childMenu.barCategory === priceItem.barCategory
                        );

                        if (updatedPriceItem) {
                            console.log('Found updated price item:', JSON.stringify(updatedPriceItem, null, 2));
                            const priceKey = Object.keys(updatedPriceItem.pricePer).find(key => key.includes(priceItem.barCategory));
                            if (priceKey) {
                                console.log(`Updating price of ${priceItem.name} from ${priceItem.price} to ${updatedPriceItem.pricePer[priceKey]}`);
                                priceItem.price = updatedPriceItem.pricePer[priceKey]; // Update the price
                            }
                        }
                        return priceItem;
                    });

                    console.log('Updated brand prices:', JSON.stringify(brand.prices, null, 2));
                }
                return brand;
            });

            // Save the updated liquorCategory
            await liquorCategory.save();
        }

        res.status(200).json({ message: 'Parent menu and child menus updated successfully' });
    } catch (err) {
        console.error('Error updating menus:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Delete a bar submenu by ID
router.delete('/barSubmenu/:id', async (req, res) => {
    try {
        const deletedBarSubmenu = await LiquorBrand.findByIdAndDelete(req.params.id);
        res.json(deletedBarSubmenu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add the route for deleting menus from the selected category
router.delete('/:liquorCategoryId/removemenus', async (req, res) => {
    const { liquorCategoryId } = req.params;
    const { menuIds } = req.body;

    try {
        // Find the LiquorCategory by ID
        const liquorCategory = await LiquorCategory.findById(liquorCategoryId);

        if (!liquorCategory) {
            return res.status(404).json({ message: 'LiquorCategory not found' });
        }

        // Filter out the brands with the specified IDs
        liquorCategory.brands = liquorCategory.brands.filter(brand => !menuIds.includes(brand._id.toString()));

        // Save the updated LiquorCategory
        const updatedLiquorCategory = await liquorCategory.save();

        res.status(200).json(updatedLiquorCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// router.post('/upload-excel', upload.single('file'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         const jsonData = xlsx.utils.sheet_to_json(sheet);

//         for (const item of jsonData) {
//             const existingMenu = await LiquorBrand.findOne({ name: item.name });

//             if (!existingMenu) {
//                 const parentMenu = new LiquorBrand({
//                     name: item.name,
//                     stockQty: 0,
//                     childMenus: []
//                 });

//                 const childMenus = [];

//                 // Iterate over the keys of the item object
//                 for (const key in item) {
//                     if (key.startsWith("pricePer")) {
//                         const quantity = key.replace("pricePer", "");
//                         const pricePerValue = item[key];
//                         const pricePerObj = {};
//                         pricePerObj[`pricePer${quantity}`] = pricePerValue;
//                         childMenus.push({
//                             name: `${item.name} ${quantity}`,
//                             barCategory: quantity,
//                             pricePer: pricePerObj, // Dynamically set the pricePer property as an object
//                             stockQty: 0,
//                             parentMenuId: parentMenu._id,

//                         });
//                     }
//                 }

//                 await parentMenu.save();
//                 await LiquorBrand.findByIdAndUpdate(parentMenu._id, { $set: { childMenus } });
//             }
//         }

//         res.status(200).json({ message: 'Data uploaded successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });





router.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = xlsx.utils.sheet_to_json(sheet);

        for (const item of jsonData) {
            const existingMenu = await LiquorBrand.findOne({ name: item.name });

            if (!existingMenu) {
                const parentMenu = new LiquorBrand({
                    name: item.name,
                    stockQty: 0,
                    childMenus: []
                });

                const childMenus = [];

                // Iterate over the keys of the item object
                for (const key in item) {
                    if (key.startsWith("pricePer")) {
                        const quantity = key.replace("pricePer", "");
                        const pricePerValue = item[key];
                        const lessStockKey = `LessStock${quantity}`;
                        const lessStockValue = item[lessStockKey] || 0;
                        const pricePerObj = {};
                        pricePerObj[`pricePer${quantity}`] = pricePerValue;
                        childMenus.push({
                            name: `${item.name} ${quantity}`,
                            barCategory: quantity,
                            pricePer: pricePerObj, // Dynamically set the pricePer property as an object
                            stockQty: 0,
                            lessStock: lessStockValue,  // Set lessStock value for each quantity
                            parentMenuId: parentMenu._id,
                        });
                    }
                }

                parentMenu.childMenus = childMenus;

                await parentMenu.save();
            } else {
                // If the menu already exists, update its lessStock value if necessary
                existingMenu.lessStock = item.lessStock || existingMenu.lessStock;
                await existingMenu.save();

                const childMenus = [];

                for (const key in item) {
                    if (key.startsWith("pricePer")) {
                        const quantity = key.replace("pricePer", "");
                        const pricePerValue = item[key];
                        const lessStockKey = `LessStock${quantity}`;
                        const lessStockValue = item[lessStockKey] || 0;
                        const pricePerObj = {};
                        pricePerObj[`pricePer${quantity}`] = pricePerValue;
                        childMenus.push({
                            name: `${item.name} ${quantity}`,
                            barCategory: quantity,
                            pricePer: pricePerObj,
                            stockQty: 0,
                            lessStock: lessStockValue,  // Set lessStock value for each quantity
                            parentMenuId: existingMenu._id,
                        });
                    }
                }

                existingMenu.childMenus = childMenus;

                await existingMenu.save();
            }
        }

        res.status(200).json({ message: 'Data uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});






router.get('/barCategory/list', async (req, res) => {
    try {
        // Find all documents in the collection
        const allMenus = await LiquorBrand.find();

        // Initialize a Set to store unique barCategory values
        const uniqueBarCategories = new Set();

        // Iterate over each document and extract the barCategory from each child menu
        allMenus.forEach(menu => {
            menu.childMenus.forEach(childMenu => {
                uniqueBarCategories.add(childMenu.barCategory);
            });
        });

        // Convert the Set to an array and send it as the response
        const uniqueBarCategoriesArray = [...uniqueBarCategories];
        res.status(200).json(uniqueBarCategoriesArray);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.get('/barSubmenu/all', async (req, res) => {
    try {
        const barSubmenus = await LiquorBrand.find({}, { name: 1, _id: 1 }); // Projection to include both 'name' and '_id' fields
        res.json(barSubmenus); // Sending the array of documents containing both name and _id fields
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/bar/barSubmenu/all/:selectedProductId', async (req, res) => {
    const { selectedProductId } = req.params;

    try {
        // Find the LiquorBrand document by selectedProductId
        const liquorBrand = await LiquorBrand.findOne({ _id: selectedProductId });

        if (!liquorBrand) {
            return res.status(404).json({ message: 'No LiquorBrand found with the given ID' });
        }

        // Extract names, IDs, and stock quantities from the childMenus array of the found document
        const childMenusWithStockQty = liquorBrand.childMenus.map(menu => ({
            _id: menu._id,
            name: menu.name,
            stockQty: menu.stockQty // Assuming stockQty is stored within each child menu object
        }));

        res.status(200).json({ childMenus: childMenusWithStockQty }); // Sending the array of objects containing name, _id, and stockQty fields
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/childmenus/list', async (req, res) => {
    try {
        // Fetch all main menus from the database
        const mainMenus = await LiquorBrand.find({}, 'childMenus');
        // Extract and send only the child menus from each main menu
        const childMenus = mainMenus.map(mainMenu => mainMenu.childMenus).flat();
        res.json(childMenus);
    } catch (error) {
        console.error('Error fetching child menus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// router.post('/sellLiquor/:parentMenuId', async (req, res) => {
//     try {
//         const { parentMenuId } = req.params;
//         const { selectedMenus } = req.body;

//         // Find the parent menu
//         const parentMenu = await LiquorBrand.findOne({ 'childMenus._id': parentMenuId });
//         if (!parentMenu) {
//             return res.status(404).send('Parent menu not found');
//         }

//         // Find the specific child menu within the parent menu's childMenus array
//         const childMenu = parentMenu.childMenus.find(menu => menu._id.equals(parentMenuId));
//         if (!childMenu) {
//             return res.status(404).send('Child menu not found');
//         }

//         // Subtract the total quantity from childMenu's stockQty
//         const totalQuantity = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenu.stockQtyMl -= totalQuantity;

//         // Save the changes to the parent menu
//         await parentMenu.save();

//         res.send('Stock updated successfully');
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// router.post('/liquorBrand/stockOut/:parentMenuId', async (req, res) => {
//     try {
//         const { parentMenuId } = req.params;
//         const { selectedMenus } = req.body;

//         // Find the parent menu
//         console.log(parentMenuId)
//         const parentMenu = await LiquorBrand.findOne({ 'childMenus.name': parentMenuId });
//         console.log('parentMenu:', parentMenu)
//         if (!parentMenu) {
//             return res.status(404).send('Parent menu not found');
//         }

//         // Find the specific child menu within the parent menu's childMenus array
//         const childMenu = parentMenu.childMenus.find(menu => menu.name === parentMenuId);
//         console.log('----------------')

//         console.log('childMenu', childMenu)
//         if (!childMenu) {
//             return res.status(404).send('Child menu not found');
//         }

//         // Subtract the total quantity from childMenu's stockQtyMl
//         const totalQuantity = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenu.stockQtyMl -= totalQuantity;

//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategory = parseInt(childMenu.barCategory.replace('ml', ''));
//         if (barCategory !== 0) {
//             childMenu.stockQty = Math.floor(childMenu.stockQtyMl / barCategory);
//             const remainingMl = childMenu.stockQtyMl % barCategory;
//             if (remainingMl > 0) {
//                 childMenu.stockQtyStr = `${childMenu.stockQty}.${remainingMl}`;
//             } else {
//                 childMenu.stockQtyStr = `${childMenu.stockQty}`;
//             }
//         } else {
//             childMenu.stockQty = 0;
//             childMenu.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu
//         await parentMenu.save();

//         res.send('Stock updated successfully');
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

// well api
// router.post('/liquorBrand/stockOut/:parentMenuId', async (req, res) => {
//     try {
//         const { parentMenuId } = req.params;
//         const { selectedMenus } = req.body;

//         // Find the parent menu in LiquorBrand
//         const parentMenuBrand = await LiquorBrand.findOne({ 'childMenus.name': parentMenuId });
//         if (!parentMenuBrand) {
//             return res.status(404).send('Parent menu not found');
//         }

//         // Find the specific child menu within the parent menu's childMenus array
//         const childMenuBrand = parentMenuBrand.childMenus.find(menu => menu.name === parentMenuId);
//         if (!childMenuBrand) {
//             return res.status(404).send('Child menu not found');
//         }

//         // Update stockQty in LiquorBrand
//         const totalQuantityBrand = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuBrand.stockQtyMl -= totalQuantityBrand;
//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryBrand = parseInt(childMenuBrand.barCategory.replace('ml', ''));
//         if (barCategoryBrand !== 0) {
//             childMenuBrand.stockQty = Math.floor(childMenuBrand.stockQtyMl / barCategoryBrand);
//             const remainingMlBrand = childMenuBrand.stockQtyMl % barCategoryBrand;
//             if (remainingMlBrand > 0) {
//                 childMenuBrand.stockQtyStr = `${childMenuBrand.stockQty}.${remainingMlBrand}`;
//             } else {
//                 childMenuBrand.stockQtyStr = `${childMenuBrand.stockQty}`;
//             }
//         } else {
//             childMenuBrand.stockQty = 0;
//             childMenuBrand.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorBrand
//         await parentMenuBrand.save();

//         // Find the parent menu in LiquorCategory
//         const parentMenuCategory = await LiquorCategory.findOne({ 'brands._id': parentMenuBrand._id });
//         console.log("parentMenuCategory", parentMenuCategory)
//         if (!parentMenuCategory) {
//             return res.status(404).send('Parent menu category not found');
//         }

//         // Find the specific child menu within the parent menu's brands array
//         const brandIndex = parentMenuCategory.brands.findIndex(brand => brand._id.equals(parentMenuBrand._id));
//         console.log("brandIndex", brandIndex)
//         const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuId);
//         console.log("childMenuCategory", childMenuCategory)
//         if (!childMenuCategory) {
//             return res.status(404).send('Child menu category not found');
//         }

//         // const parentMenuCategory = await LiquorCategory.findOne({ 'brands.name': parentMenuBrand.name });
//         // if (!parentMenuCategory) {
//         //     return res.status(404).send('Parent menu category not found');
//         // }

//         // // Find the specific child menu within the parent menu's brands array
//         // const brandIndex = parentMenuCategory.brands.findIndex(brand => brand.name === parentMenuBrand.name);
//         // if (brandIndex === -1) {
//         //     return res.status(404).send('Brand not found');
//         // }

//         // const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuId);
//         // if (!childMenuCategory) {
//         //     return res.status(404).send('Child menu category not found');
//         // }


//         // Update stockQty in LiquorCategory
//         const totalQuantityCategory = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuCategory.stockQtyMl -= totalQuantityCategory;
//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryCategory = parseInt(childMenuCategory.barCategory.replace('ml', ''));
//         if (barCategoryCategory !== 0) {
//             childMenuCategory.stockQty = Math.floor(childMenuCategory.stockQtyMl / barCategoryCategory);
//             const remainingMlCategory = childMenuCategory.stockQtyMl % barCategoryCategory;
//             if (remainingMlCategory > 0) {
//                 childMenuCategory.stockQtyStr = `${childMenuCategory.stockQty}.${remainingMlCategory}`;
//             } else {
//                 childMenuCategory.stockQtyStr = `${childMenuCategory.stockQty}`;
//             }
//         } else {
//             childMenuCategory.stockQty = 0;
//             childMenuCategory.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorCategory
//         await parentMenuCategory.save();

//         res.send('Stock updated successfully');
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// waiting perfect
// router.post('/liquorBrand/stockOut/:parentMenuId', async (req, res) => {
//     try {
//         const { parentMenuId } = req.params;
//         const { selectedMenus } = req.body;

//         // Find the parent menu in LiquorBrand
//         const parentMenuBrand = await LiquorBrand.findOne({ 'childMenus.name': parentMenuId });
//         if (!parentMenuBrand) {
//             return res.status(404).send('Parent menu not found');
//         }

//         // Find the specific child menu within the parent menu's childMenus array
//         const childMenuBrand = parentMenuBrand.childMenus.find(menu => menu.name === parentMenuId);
//         if (!childMenuBrand) {
//             return res.status(404).send('Child menu not found');
//         }

//         // Update stockQty in LiquorBrand
//         const totalQuantityBrand = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuBrand.stockQtyMl -= totalQuantityBrand;
//         console.log("totalQuantityBrand",totalQuantityBrand)
//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryBrand = parseInt(childMenuBrand.barCategory.replace('ml', ''));
//         if (barCategoryBrand !== 0) {
//             childMenuBrand.stockQty = Math.floor(childMenuBrand.stockQtyMl / barCategoryBrand);
//             const remainingMlBrand = childMenuBrand.stockQtyMl % barCategoryBrand;
//             if (remainingMlBrand > 0) {
//                 childMenuBrand.stockQtyStr = `${childMenuBrand.stockQty}.${remainingMlBrand}`;
//             } else {
//                 childMenuBrand.stockQtyStr = `${childMenuBrand.stockQty}`;
//             }
//         } else {
//             childMenuBrand.stockQty = 0;
//             childMenuBrand.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorBrand
//         await parentMenuBrand.save();

//         // Find the parent menu in LiquorCategory
//         const parentMenuCategory = await LiquorCategory.findOne({ 'brands._id': parentMenuBrand._id });
//         console.log("parentMenuCategory", parentMenuCategory)
//         if (!parentMenuCategory) {
//             // Skip updating LiquorCategory if the parent menu category is not found
//             return res.send('Stock updated successfully for LiquorBrand only');
//         }

//         // Find the specific child menu within the parent menu's brands array
//         const brandIndex = parentMenuCategory.brands.findIndex(brand => brand._id.equals(parentMenuBrand._id));
//         console.log("brandIndex", brandIndex)
//         const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuId);
//         console.log("childMenuCategory", childMenuCategory)
//         if (!childMenuCategory) {
//             return res.status(404).send('Child menu category not found');
//         }

//         // Update stockQty in LiquorCategory
//         const totalQuantityCategory = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuCategory.stockQtyMl -= totalQuantityCategory;
//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryCategory = parseInt(childMenuCategory.barCategory.replace('ml', ''));
//         if (barCategoryCategory !== 0) {
//             childMenuCategory.stockQty = Math.floor(childMenuCategory.stockQtyMl / barCategoryCategory);
//             const remainingMlCategory = childMenuCategory.stockQtyMl % barCategoryCategory;
//             if (remainingMlCategory > 0) {
//                 childMenuCategory.stockQtyStr = `${childMenuCategory.stockQty}.${remainingMlCategory}`;
//             } else {
//                 childMenuCategory.stockQtyStr = `${childMenuCategory.stockQty}`;
//             }
//         } else {
//             childMenuCategory.stockQty = 0;
//             childMenuCategory.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorCategory
//         await parentMenuCategory.save();

//         res.send('Stock updated successfully');
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// router.post('/liquorBrand/stockOut/:parentMenuName', async (req, res) => {
//     try {
//         const { parentMenuName } = req.params; // Using parentMenuName instead of parentMenuId
//         const { selectedMenus } = req.body;

//         // Find the parent menu in LiquorBrand by parentMenuName
//         const parentMenuBrand = await LiquorBrand.findOne({ 'childMenus.name': parentMenuName });
//         if (!parentMenuBrand) {
//             return res.status(404).send('Parent menu not found');
//         }

//         // Find the specific child menu within the parent menu's childMenus array using parentMenuName
//         const childMenuBrand = parentMenuBrand.childMenus.find(menu => menu.name === parentMenuName);
//         if (!childMenuBrand) {
//             return res.status(404).send('Child menu not found');
//         }

//         // Update stockQty in LiquorBrand
//         const totalQuantityBrand = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuBrand.stockQtyMl -= totalQuantityBrand;

//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryBrand = parseInt(childMenuBrand.barCategory.replace('ml', ''));
//         if (barCategoryBrand !== 0) {
//             childMenuBrand.stockQty = Math.floor(childMenuBrand.stockQtyMl / barCategoryBrand);
//             const remainingMlBrand = childMenuBrand.stockQtyMl % barCategoryBrand;
//             childMenuBrand.stockQtyStr = remainingMlBrand > 0 
//                 ? `${childMenuBrand.stockQty}.${remainingMlBrand}`
//                 : `${childMenuBrand.stockQty}`;
//         } else {
//             childMenuBrand.stockQty = 0;
//             childMenuBrand.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorBrand
//         await parentMenuBrand.save();

//         // Find the parent menu in LiquorCategory using the brand's `_id`
//         const parentMenuCategory = await LiquorCategory.findOne({ 'brands._id': parentMenuBrand._id });
//         if (!parentMenuCategory) {
//             return res.send('Stock updated successfully for LiquorBrand only');
//         }

//         // Find the specific child menu within the parent menu's brands array using parentMenuName
//         const brandIndex = parentMenuCategory.brands.findIndex(brand => brand._id.equals(parentMenuBrand._id));
//         const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuName);
//         if (!childMenuCategory) {
//             return res.status(404).send('Child menu category not found');
//         }

//         // Update stockQty in LiquorCategory
//         const totalQuantityCategory = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//         childMenuCategory.stockQtyMl -= totalQuantityCategory;

//         // Update stockQty based on stockQtyMl and barCategory
//         const barCategoryCategory = parseInt(childMenuCategory.barCategory.replace('ml', ''));
//         if (barCategoryCategory !== 0) {
//             childMenuCategory.stockQty = Math.floor(childMenuCategory.stockQtyMl / barCategoryCategory);
//             const remainingMlCategory = childMenuCategory.stockQtyMl % barCategoryCategory;
//             childMenuCategory.stockQtyStr = remainingMlCategory > 0 
//                 ? `${childMenuCategory.stockQty}.${remainingMlCategory}`
//                 : `${childMenuCategory.stockQty}`;
//         } else {
//             childMenuCategory.stockQty = 0;
//             childMenuCategory.stockQtyStr = '0';
//         }

//         // Save the changes to the parent menu in LiquorCategory
//         await parentMenuCategory.save();

//         res.send('Stock updated successfully');
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });



// router.post('/liquorBrand/stockOut', async (req, res) => {
//     try {
//         const { selectedParentIds, selectedMenusList } = req.body;

//         // Validate the input
//         if (!Array.isArray(selectedParentIds) || selectedParentIds.length === 0) {
//             return res.status(400).send('Invalid request: selectedParentIds array is required.');
//         }

//         if (!Array.isArray(selectedMenusList) || selectedMenusList.length === 0) {
//             return res.status(400).send('Invalid request: selectedMenusList array is required.');
//         }

//         for (let i = 0; i < selectedParentIds.length; i++) {
//             const parentMenuName = selectedParentIds[i];
//             const selectedMenus = selectedMenusList[i];
//             console.log(selectedMenus)

//             // Find the parent menu in LiquorBrand by the name of the child menu
//             const parentMenuBrand = await LiquorBrand.findOne({ 'childMenus.name': parentMenuName });
//             console.log(parentMenuBrand)
//             if (!parentMenuBrand) {
//                 return res.status(404).send(`Parent menu not found for ${parentMenuName}`);
//             }

//             // Find the specific child menu within the parent menu's childMenus array by name
//             const childMenuBrand = parentMenuBrand.childMenus.find(menu => menu.name === parentMenuName);
//             if (!childMenuBrand) {
//                 return res.status(404).send(`Child menu not found for ${parentMenuName}`);
//             }

//             // Update stockQty in LiquorBrand
//             const totalQuantityBrand = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//             childMenuBrand.stockQtyMl -= totalQuantityBrand;
//             console.log(`Total quantity reduced from LiquorBrand for ${parentMenuName}:`, totalQuantityBrand);

//             // Update stockQty based on stockQtyMl and barCategory
//             const barCategoryBrand = parseInt(childMenuBrand.barCategory.replace('ml', ''), 10);
//             if (barCategoryBrand > 0) {
//                 childMenuBrand.stockQty = Math.floor(childMenuBrand.stockQtyMl / barCategoryBrand);
//                 const remainingMlBrand = childMenuBrand.stockQtyMl % barCategoryBrand;
//                 childMenuBrand.stockQtyStr = remainingMlBrand > 0
//                     ? `${childMenuBrand.stockQty}.${remainingMlBrand}`
//                     : `${childMenuBrand.stockQty}`;
//             } else {
//                 childMenuBrand.stockQty = 0;
//                 childMenuBrand.stockQtyStr = '0';
//             }

//             // Save the changes to the parent menu in LiquorBrand
//             await parentMenuBrand.save();

//             // Find the parent menu in LiquorCategory by the parent menu brand's name
//             const parentMenuCategory = await LiquorCategory.findOne({ 'brands.name': parentMenuBrand.name });
//             if (!parentMenuCategory) {
//                 // Skip updating LiquorCategory if the parent menu category is not found
//                 console.log(`Stock updated successfully for LiquorBrand only for ${parentMenuName}`);
//                 continue;
//             }

//             // Find the specific child menu within the parent menu's brands array by name
//             const brandIndex = parentMenuCategory.brands.findIndex(brand => brand.name === parentMenuBrand.name);
//             const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuName);
//             if (!childMenuCategory) {
//                 return res.status(404).send(`Child menu category not found for ${parentMenuName}`);
//             }

//             // Update stockQty in LiquorCategory
//             const totalQuantityCategory = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
//             childMenuCategory.stockQtyMl -= totalQuantityCategory;
//             console.log(`Total quantity reduced from LiquorCategory for ${parentMenuName}:`, totalQuantityCategory);

//             // Update stockQty based on stockQtyMl and barCategory
//             const barCategoryCategory = parseInt(childMenuCategory.barCategory.replace('ml', ''), 10);
//             if (barCategoryCategory > 0) {
//                 childMenuCategory.stockQty = Math.floor(childMenuCategory.stockQtyMl / barCategoryCategory);
//                 const remainingMlCategory = childMenuCategory.stockQtyMl % barCategoryCategory;
//                 childMenuCategory.stockQtyStr = remainingMlCategory > 0
//                     ? `${childMenuCategory.stockQty}.${remainingMlCategory}`
//                     : `${childMenuCategory.stockQty}`;
//             } else {
//                 childMenuCategory.stockQty = 0;
//                 childMenuCategory.stockQtyStr = '0';
//             }

//             // Save the changes to the parent menu in LiquorCategory
//             await parentMenuCategory.save();
//         }

//         res.send('Stock updated successfully for all selected parent menus.');
//     } catch (error) {
//         console.error('Error updating stock:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


router.post('/liquorBrand/stockOut', async (req, res) => {
    try {
          console.log('Request body:', req.body);

        const { selectedParentIds, selectedMenusList } = req.body;

        // Validate the input
        if (!Array.isArray(selectedParentIds) || selectedParentIds.length === 0) {
            return res.status(400).send('Invalid request: selectedParentIds array is required.');
        }

        if (!Array.isArray(selectedMenusList) || selectedMenusList.length === 0) {
            return res.status(400).send('Invalid request: selectedMenusList array is required.');
        }

        console.log('Received selectedParentIds:', selectedParentIds);
        console.log('Received selectedMenusList:', selectedMenusList);

        for (let i = 0; i < selectedParentIds.length; i++) {
            const parentMenuName = selectedParentIds[i];
            const selectedMenus = selectedMenusList[i];

            if (!parentMenuName) {
                console.error(`Parent menu name is null or undefined at index ${i}`);
                return res.status(400).send('Parent menu name is null or undefined.');
            }

            if (!Array.isArray(selectedMenus)) {
                console.error(`Selected menus is not an array at index ${i}`);
                return res.status(400).send('Selected menus is not an array.');
            }

            console.log(`Processing parentMenuName: ${parentMenuName}`);
            console.log(`Selected menus:`, selectedMenus);

            // Find the parent menu in LiquorBrand by the name of the child menu
            const parentMenuBrand = await LiquorBrand.findOne({ 'childMenus.name': parentMenuName });
            if (!parentMenuBrand) {
                console.error(`Parent menu not found for ${parentMenuName}`);
                return res.status(404).send(`Parent menu not found for ${parentMenuName}`);
            }

            // Find the specific child menu within the parent menu's childMenus array by name
            const childMenuBrand = parentMenuBrand.childMenus.find(menu => menu.name === parentMenuName);
            if (!childMenuBrand) {
                console.error(`Child menu not found for ${parentMenuName}`);
                return res.status(404).send(`Child menu not found for ${parentMenuName}`);
            }

            // Update stockQty in LiquorBrand
            const totalQuantityBrand = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
            childMenuBrand.stockQtyMl -= totalQuantityBrand;
            console.log(`Total quantity reduced from LiquorBrand for ${parentMenuName}:`, totalQuantityBrand);

            // Update stockQty based on stockQtyMl and barCategory
            const barCategoryBrand = parseInt(childMenuBrand.barCategory.replace('ml', ''), 10);
            if (barCategoryBrand > 0) {
                childMenuBrand.stockQty = Math.floor(childMenuBrand.stockQtyMl / barCategoryBrand);
                const remainingMlBrand = childMenuBrand.stockQtyMl % barCategoryBrand;
                childMenuBrand.stockQtyStr = remainingMlBrand > 0
                    ? `${childMenuBrand.stockQty}.${remainingMlBrand}`
                    : `${childMenuBrand.stockQty}`;
            } else {
                childMenuBrand.stockQty = 0;
                childMenuBrand.stockQtyStr = '0';
            }

            // Save the changes to the parent menu in LiquorBrand
            await parentMenuBrand.save();

            // Find the parent menu in LiquorCategory by the parent menu brand's name
            const parentMenuCategory = await LiquorCategory.findOne({ 'brands.name': parentMenuBrand.name });
            if (!parentMenuCategory) {
                console.log(`Stock updated successfully for LiquorBrand only for ${parentMenuName}`);
                continue;
            }

            // Find the specific child menu within the parent menu's brands array by name
            const brandIndex = parentMenuCategory.brands.findIndex(brand => brand.name === parentMenuBrand.name);
            const childMenuCategory = parentMenuCategory.brands[brandIndex].prices.find(menu => menu.name === parentMenuName);
            if (!childMenuCategory) {
                console.error(`Child menu category not found for ${parentMenuName}`);
                return res.status(404).send(`Child menu category not found for ${parentMenuName}`);
            }

            // Update stockQty in LiquorCategory
            const totalQuantityCategory = selectedMenus.reduce((total, selectedMenu) => total + selectedMenu.quantity, 0);
            childMenuCategory.stockQtyMl -= totalQuantityCategory;
            console.log(`Total quantity reduced from LiquorCategory for ${parentMenuName}:`, totalQuantityCategory);

            // Update stockQty based on stockQtyMl and barCategory
            const barCategoryCategory = parseInt(childMenuCategory.barCategory.replace('ml', ''), 10);
            if (barCategoryCategory > 0) {
                childMenuCategory.stockQty = Math.floor(childMenuCategory.stockQtyMl / barCategoryCategory);
                const remainingMlCategory = childMenuCategory.stockQtyMl % barCategoryCategory;
                childMenuCategory.stockQtyStr = remainingMlCategory > 0
                    ? `${childMenuCategory.stockQty}.${remainingMlCategory}`
                    : `${childMenuCategory.stockQty}`;
            } else {
                childMenuCategory.stockQty = 0;
                childMenuCategory.stockQtyStr = '0';
            }

            // Save the changes to the parent menu in LiquorCategory
            await parentMenuCategory.save();
        }

        res.send('Stock updated successfully for all selected parent menus.');
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).send('Internal Server Error');
    }
});




// router.post('/liquorBrand/stockIn', async (req, res) => {
//     try {
//         const { items } = req.body;

//         if (!items || items.length === 0) {
//             return res.status(400).json({ error: 'Items are required and cannot be empty.' });
//         }

//         // Process each item to update stock quantities
//         await Promise.all(items.map(async (item) => {
//             const { name, quantity, selectedParentId } = item;

//             // Find the LiquorBrand that contains the selectedParentId
//             const parentMenu = await LiquorBrand.findOne({ 'childMenus.name': selectedParentId });

//             if (!parentMenu) {
//                 return res.status(404).json({ error: `Parent menu with name ${selectedParentId} not found.` });
//             }

//             // Find the child menu
//             const childMenu = parentMenu.childMenus.find(child => child.name === name);

//             if (childMenu) {
//                 const mlQuantity = quantity * parseFloat(childMenu.barCategory.replace('ml', '')); // Calculate the total ml quantity
//                 const parentChildMenu = parentMenu.childMenus.find(child => child.name === selectedParentId);

//                 if (parentChildMenu) {
//                     // Update stock quantities
//                     parentChildMenu.stockQty += Math.floor(mlQuantity / parseFloat(parentChildMenu.barCategory.replace('ml', '')));
//                     parentChildMenu.stockQtyMl += mlQuantity;

//                     // Update stockQtyStr
//                     const barCategoryCategory = parseFloat(parentChildMenu.barCategory.replace('ml', ''));
//                     if (barCategoryCategory > 0) {
//                         parentChildMenu.stockQty = Math.floor(parentChildMenu.stockQtyMl / barCategoryCategory);
//                         const remainingMlCategory = parentChildMenu.stockQtyMl % barCategoryCategory;
//                         parentChildMenu.stockQtyStr = remainingMlCategory > 0
//                             ? `${parentChildMenu.stockQty}.${remainingMlCategory}`
//                             : `${parentChildMenu.stockQty}`;
//                     } else {
//                         parentChildMenu.stockQty = 0;
//                         parentChildMenu.stockQtyStr = '0';
//                     }

//                     // Save changes to the parent menu
//                     await parentMenu.save();
//                 }
//             }
//         }));

//         res.status(200).json({ message: 'Stock quantities updated successfully.' });
//     } catch (error) {
//         console.error('Error updating stock quantities:', error);
//         res.status(500).json({ error: 'Internal server error.' });
//     }
// });

router.post('/liquorBrand/stockIn', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items are required and cannot be empty.' });
        }

        const errors = [];

        // Process each item to update stock quantities
        await Promise.all(items.map(async (item) => {
            const { name, quantity, selectedParentId } = item;

            // Find the LiquorBrand that contains the selectedParentId
            const parentMenu = await LiquorBrand.findOne({ 'childMenus.name': selectedParentId });

            if (!parentMenu) {
                errors.push(`Parent menu with name ${selectedParentId} not found.`);
                return; // Skip further processing for this item
            }

            // Find the child menu
            const childMenu = parentMenu.childMenus.find(child => child.name === name);

            if (childMenu) {
                const mlQuantity = quantity * parseFloat(childMenu.barCategory.replace('ml', '')); // Calculate the total ml quantity
                const parentChildMenu = parentMenu.childMenus.find(child => child.name === selectedParentId);

                if (parentChildMenu) {
                    // Update stock quantities
                    parentChildMenu.stockQty += Math.floor(mlQuantity / parseFloat(parentChildMenu.barCategory.replace('ml', '')));
                    parentChildMenu.stockQtyMl += mlQuantity;

                    // Update stockQtyStr
                    const barCategoryCategory = parseFloat(parentChildMenu.barCategory.replace('ml', ''));
                    if (barCategoryCategory > 0) {
                        parentChildMenu.stockQty = Math.floor(parentChildMenu.stockQtyMl / barCategoryCategory);
                        const remainingMlCategory = parentChildMenu.stockQtyMl % barCategoryCategory;
                        parentChildMenu.stockQtyStr = remainingMlCategory > 0
                            ? `${parentChildMenu.stockQty}.${remainingMlCategory}`
                            : `${parentChildMenu.stockQty}`;
                    } else {
                        parentChildMenu.stockQty = 0;
                        parentChildMenu.stockQtyStr = '0';
                    }

                    // Save changes to the parent menu
                    await parentMenu.save();
                }
            } else {
                errors.push(`Child menu with name ${name} not found in parent ${selectedParentId}.`);
            }
        }));

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        res.status(200).json({ message: 'Stock quantities updated successfully.' });
    } catch (error) {
        console.error('Error updating stock quantities:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});






router.get('/liquorBrand/stock', async (req, res) => {
    try {
        // Fetch all LiquorBrand documents
        const liquorBrands = await LiquorBrand.find();

        // Map through each LiquorBrand document to extract stock quantity and name of each menu item
        const menuStocks = liquorBrands.map((liquorBrand) => {
            const brandName = liquorBrand.name;
            const menuStock = liquorBrand.childMenus.map((childMenu) => ({
                name: childMenu.name,
                stockQty: childMenu.stockQty,
                stockQtyMl: childMenu.stockQtyMl,
                stockQtyStr: childMenu.stockQtyStr,
                barCategory: childMenu.barCategory,

            }));
            return {
                brandName,
                menuStock
            };
        });
        // Send the menu stocks as response
        res.json(menuStocks);
    } catch (error) {
        // If an error occurs, send an error response
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




router.get('/getMenu/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Replace 'YourModel' with your Mongoose model for LiquorBrand
        const menu = await LiquorBrand.findById(id);

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        // console.log(menu)
        res.json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});



router.get('/liquorBrand/sizes', async (req, res) => {
    try {
        // Retrieve all childMenus from the collection
        const liquorBrands = await LiquorBrand.find().lean();

        // Extract unique sizes from childMenus
        const sizes = liquorBrands.flatMap(brand => brand.childMenus.map(menu => menu.barCategory)).filter((size, index, self) => self.indexOf(size) === index);

        // Send the sizes as a JSON response
        res.json({ sizes });
    } catch (error) {
        console.error('Error fetching sizes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// purchase
// router.get('/stockQty/barmenu', async (req, res) => {
//   try {
//     // Read liquorBrand data from JSON file
//     const stockDirPath = path.join(__dirname, 'stock');
//     const dirs = await fs.readdir(stockDirPath, { withFileTypes: true });

//     // Filter only directories
//     const folders = dirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
//     if (folders.length === 0) {
//       return res.status(404).json({ message: 'No stock data available' });
//     }

//     // Sort the folders to find the latest one
//     folders.sort((a, b) => new Date(b) - new Date(a));
//     const latestFolder = folders[0];
//     const filePath = path.join(stockDirPath, latestFolder, 'stockData.json');
//     const data = await fs.readFile(filePath, 'utf8');
//     const liquorBrands = JSON.parse(data);

//     // Fetch barPurchase data from MongoDB
//     const barPurchases = await BarPurchase.find();

//     // Create a map to quickly lookup purchased quantities by item name
//     const purchaseMap = new Map();
//     barPurchases.forEach(purchase => {
//       purchase.items.forEach(item => {
//         if (purchaseMap.has(item.name)) {
//           purchaseMap.set(item.name, purchaseMap.get(item.name) + item.quantity);
//         } else {
//           purchaseMap.set(item.name, item.quantity);
//         }
//       });
//     });

//     // Merge data
//     const mergedData = liquorBrands.map(brand => {
//       const updatedChildMenus = brand.childMenus.map(menu => {
//         return {
//           ...menu,
//           stockQty: purchaseMap.get(menu.name) || 0,
//         };
//       });
//       return {
//         ...brand,
//         stockQty: purchaseMap.get(brand.name) || 0,
//         childMenus: updatedChildMenus,
//       };
//     });

//     res.json(mergedData);
//   } catch (err) {
//     console.error('Error fetching stock data', err);
//     res.status(500).json({ message: 'Failed to fetch stock data' });
//   }
// });


// purchase
router.get('/stockQty/barmenu', async (req, res) => {
    try {
        const { date } = req.query; // Get the date from query parameters

        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        // Read liquorBrand data from JSON file based on the provided date
        const stockDirPath = path.join(__dirname, 'stock', date);
        const filePath = path.join(stockDirPath, 'stockData.json');

        try {
            const data = await fs.readFile(filePath, 'utf8');
            const liquorBrands = JSON.parse(data);

            // Fetch barPurchase data from MongoDB based on the provided date
            const barPurchases = await BarPurchase.find({ date: new Date(date) });

            // Create a map to quickly lookup purchased quantities by item name
            const purchaseMap = new Map();
            barPurchases.forEach(purchase => {
                purchase.items.forEach(item => {
                    if (purchaseMap.has(item.name)) {
                        purchaseMap.set(item.name, purchaseMap.get(item.name) + item.quantity);
                    } else {
                        purchaseMap.set(item.name, item.quantity);
                    }
                });
            });

            // Merge data
            const mergedData = liquorBrands.map(brand => {
                const updatedChildMenus = brand.childMenus.map(menu => {
                    return {
                        ...menu,
                        stockQty: purchaseMap.get(menu.name) || 0,
                    };
                });
                return {
                    ...brand,
                    stockQty: purchaseMap.get(brand.name) || 0,
                    childMenus: updatedChildMenus,
                };
            });

            res.json(mergedData);
        } catch (err) {
            return res.status(404).json({ message: 'No data available for the specified date' });
        }
    } catch (err) {
        console.error('Error fetching stock data', err);
        res.status(500).json({ message: 'Failed to fetch stock data' });
    }
});



// router.post('/updateStock', async (req, res) => {
//     try {
//         // Fetch all liquor brands
//         const liquorBrands = await LiquorBrand.find({});

//         // Extract stockQty values
//         const stockData = liquorBrands.map((brand) => {
//             return {
//                 name: brand.name,
//                 stockQty: brand.stockQty,
//                 childMenus: brand.childMenus.map((menu) => ({
//                     name: menu.name,
//                     stockQty: menu.stockQty,
//                 })),
//             };
//         });

//         // Get the current date
//         const currentDate = new Date();
//         const year = currentDate.getFullYear();
//         const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
//         const day = currentDate.getDate().toString().padStart(2, '0');

//         // Define the path to the JSON file
//         const dirPath = path.join(__dirname, 'stock', `${year}-${month}-${day}`);
//         const filePath = path.join(dirPath, 'stockData.json');

//         // Create the directory if it doesn't exist
//         await fs.mkdir(dirPath, { recursive: true });

//         // Write the stock data to the JSON file
//         await fs.writeFile(filePath, JSON.stringify(stockData, null, 2));

//         res.status(200).json({ message: 'Stock data written to file successfully' });

//     } catch (error) {
//         console.error('Error fetching data from database', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });




router.post('/updateStock', async (req, res) => {
    try {
        // Fetch all liquor brands
        const liquorBrands = await LiquorBrand.find({});

        if (liquorBrands.length === 0) {
            return res.status(200).json({ message: 'No stock data to update' });
        }
        // Extract stockQty values
        const stockData = liquorBrands.map((brand) => {
            return {
                name: brand.name,
                stockQty: brand.stockQty,
                childMenus: brand.childMenus.map((menu) => ({
                    name: menu.name,
                    stockQty: menu.stockQty,
                    stockQtyStr: menu.stockQtyStr
                })),
            };
        });

        // Get the current date
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');

        // Define the path to the JSON file
        const dirPath = path.join(__dirname, 'stock', `${year}-${month}-${day}`);
        const filePath = path.join(dirPath, 'stockData.json');

        // Check if the file already exists
        try {
            await fs.access(filePath);
            // console.log(filePath)
            // File exists
            console.log('Stock data already exists for today')
            return res.status(200).json({ message: 'Stock data already exists for today' });
        } catch (error) {
            // File does not exist
            // Create the directory if it doesn't exist
            await fs.mkdir(dirPath, { recursive: true });
            // Write the stock data to the JSON file
            await fs.writeFile(filePath, JSON.stringify(stockData, null, 2));
            // console.log("File created")
            return res.status(200).json({ message: 'Stock data written to file successfully' });
        }

    } catch (error) {
        console.error('Error fetching data from database', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});




// opening balance
router.get('/stockQty/barmenus', async (req, res) => {
    try {
        const { date } = req.query;
        const stockDirPath = path.join(__dirname, 'stock');
        const dirs = await fs.readdir(stockDirPath, { withFileTypes: true });

        // Filter only directories
        const folders = dirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

        if (folders.length === 0) {
            return res.status(404).json({ message: 'No stock data available' });
        }

        // Sort the folders to find the latest one
        folders.sort((a, b) => new Date(b) - new Date(a));
        const latestFolder = folders[0];

        let filePath;
        if (date) {
            filePath = path.join(stockDirPath, date, 'stockData.json');
        } else {
            filePath = path.join(stockDirPath, latestFolder, 'stockData.json');
        }

        const data = await fs.readFile(filePath, 'utf8');
        const stockData = JSON.parse(data);

        res.json(stockData);
    } catch (err) {
        console.error('Error reading stock data file', err);
        res.status(500).json({ message: 'Failed to read stock data file' });
    }
});



// sell stock api
// router.get('/order/stockQty/sellQty', async (req, res) => {
//     try {
//         const { date } = req.query;
//         if (!date) {
//             return res.status(400).json({ message: 'Date query parameter is required' });
//         }

//         // Define the path to the stock data file
//         const stockDirPath = path.join(__dirname, 'stock', date);
//         const filePath = path.join(stockDirPath, 'stockData.json');

//         // Read the menu list from the JSON file
//         let stockData;
//         try {
//             const data = await fs.readFile(filePath, 'utf8');
//             stockData = JSON.parse(data);
//         } catch (err) {
//             return res.status(404).json({ message: 'No data available for the specified date' });
//         }

//         // Query orders from the specified date
//         const queryDate = new Date(date);
//         const orders = await Order.find({
//             orderDate: {
//                 $gte: queryDate,
//                 $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000), // Next day
//             },
//         });

//         // Create a dictionary for sell quantities initialized to 0
//         const sellQuantity = {};
//         stockData.forEach(menuItem => {
//             sellQuantity[menuItem.name] = 0;
//             if (menuItem.childMenus) {
//                 menuItem.childMenus.forEach(childMenu => {
//                     sellQuantity[childMenu.name] = 0;
//                 });
//             }
//         });

//         // Calculate the sold quantities
//         orders.forEach(order => {
//             order.items.forEach(item => {
//                 if (!item.isCanceled && sellQuantity.hasOwnProperty(item.name)) { // Only count non-canceled items
//                     sellQuantity[item.name] += item.quantity;
//                 }
//             });
//         });

//         // Merge data to return the response in the desired format
//         const mergedData = stockData.map(menuItem => {
//             const updatedChildMenus = menuItem.childMenus ? menuItem.childMenus.map(childMenu => {
//                 return {
//                     ...childMenu,
//                     sellQty: sellQuantity[childMenu.name],
//                 };
//             }) : [];

//             return {
//                 ...menuItem,
//                 sellQty: sellQuantity[menuItem.name],
//                 childMenus: updatedChildMenus,
//             };
//         });

//         res.json(mergedData);
//     } catch (error) {
//         console.error('Error fetching sell quantity:', error);
//         res.status(500).json({ message: 'Failed to fetch sell quantity' });
//     }
// });



router.get('/order/stockQty/sellQty', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date query parameter is required' });
        }

        // Define the path to the stock data file
        const stockDirPath = path.join(__dirname, 'stock', date);
        const filePath = path.join(stockDirPath, 'stockData.json');

        // Read the menu list from the JSON file
        let stockData;
        try {
            const data = await fs.readFile(filePath, 'utf8');
            stockData = JSON.parse(data);
        } catch (err) {
            return res.status(404).json({ message: 'No data available for the specified date' });
        }

        // Query orders from the specified date
        const queryDate = new Date(date);
        const orders = await Order.find({
            orderDate: {
                $gte: queryDate,
                $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000), // Next day
            },
        });

        // Create a dictionary for sell quantities initialized to 0
        const sellQuantity = {};
        stockData.forEach(menuItem => {
            sellQuantity[menuItem.name] = 0;
            if (menuItem.childMenus) {
                menuItem.childMenus.forEach(childMenu => {
                    sellQuantity[childMenu.name] = 0;
                });
            }
        });

        // Calculate the sold quantities in milliliters
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!item.isCanceled && item.barCategory && item.selectedParentId && sellQuantity.hasOwnProperty(item.selectedParentId)) { // Only count non-canceled items
                    const itemVolume = parseInt(item.barCategory, 10);
                    if (!isNaN(itemVolume)) {
                        sellQuantity[item.selectedParentId] += item.quantity * itemVolume;
                    }
                }
            });
        });

        // Convert the sold quantities into parent units
        stockData.forEach(menuItem => {
            if (menuItem.childMenus) {
                menuItem.childMenus.forEach(childMenu => {
                    const childVolume = parseInt(childMenu.barCategory, 10);
                    if (sellQuantity[childMenu.name] > 0 && childVolume > 0) {
                        sellQuantity[menuItem.name] += Math.floor(sellQuantity[childMenu.name] / childVolume);
                        sellQuantity[childMenu.name] = 0; // Reset to avoid double counting
                    }
                });
            }
        });

        // Merge data to return the response in the desired format
        const mergedData = stockData.map(menuItem => {
            const updatedChildMenus = menuItem.childMenus ? menuItem.childMenus.map(childMenu => {
                return {
                    ...childMenu,
                    sellQty: sellQuantity[childMenu.name],
                };
            }) : [];

            return {
                ...menuItem,
                sellQty: sellQuantity[menuItem.name],
                childMenus: updatedChildMenus,
            };
        });

        res.json(mergedData);
    } catch (error) {
        console.error('Error fetching sell quantity:', error);
        res.status(500).json({ message: 'Failed to fetch sell quantity' });
    }
});


// closing Stock
router.get('/order/stockQty/updateClosing', async (req, res) => {
    try {
        const liquorBrands = await LiquorBrand.find();

        const response = liquorBrands.map(liquorBrand => ({
            name: liquorBrand.name,
            stockQty: liquorBrand.stockQty,
            childMenus: liquorBrand.childMenus.map(childMenu => ({
                name: childMenu.name,
                stockQty: childMenu.stockQty,
                stockQtyStr: childMenu.stockQtyStr,
            })),
        }));
        console.log(response)
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// saved closingStock
router.post('/updateClosing', async (req, res) => {
    try {
        // Fetch all liquor brands
        const liquorBrands = await LiquorBrand.find({});

        if (liquorBrands.length === 0) {
            return res.status(200).json({ message: 'No stock data to update' });
        }

        // Extract stockQty values
        const stockData = liquorBrands.map((brand) => {
            return {
                name: brand.name,
                stockQty: brand.stockQty,
                childMenus: brand.childMenus.map((menu) => ({
                    name: menu.name,
                    stockQty: menu.stockQty,
                    stockQtyStr: menu.stockQtyStr,

                })),
            };
        });

        // Get the current date
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');

        // Define the path to the JSON file
        const dirPath = path.join(__dirname, 'stockClose', `${year}-${month}-${day}`);
        const filePath = path.join(dirPath, 'stockData.json');

        try {
            await fs.access(filePath);
            // console.log(filePath)
            // File exists
            console.log('Stock data already exists for today')
            return res.status(200).json({ message: 'Stock data already exists for today' });
        } catch (error) {
            // File does not exist
            // Create the directory if it doesn't exist
            await fs.mkdir(dirPath, { recursive: true });
            // Write the stock data to the JSON file
            await fs.writeFile(filePath, JSON.stringify(stockData, null, 2));
            // console.log("File created")
            return res.status(200).json({ message: 'Stock data written to file successfully' });
        }

        // Create the directory if it doesn't exist
        // await fs.mkdir(dirPath, { recursive: true });

        // Write the stock data to the JSON file
        // await fs.writeFile(filePath, JSON.stringify(stockData, null, 2));
        res.status(200).json({ message: 'Closing Stock data written to file successfully' });
    } catch (error) {
        console.error('Error fetching data from database', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/order/closeStockQty/barmenus', async (req, res) => {
    try {
        const { date } = req.query;
        const stockDirPath = path.join(__dirname, 'stockClose');
        const dirs = await fs.readdir(stockDirPath, { withFileTypes: true });

        // Filter only directories
        const folders = dirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

        if (folders.length === 0) {
            return res.status(404).json({ message: 'No stock data available' });
        }

        // Sort the folders to find the latest one
        folders.sort((a, b) => new Date(b) - new Date(a));
        const latestFolder = folders[0];

        let filePath;
        if (date) {
            filePath = path.join(stockDirPath, date, 'stockData.json');
        } else {
            filePath = path.join(stockDirPath, latestFolder, 'stockData.json');
        }

        const data = await fs.readFile(filePath, 'utf8');
        const stockData = JSON.parse(data);

        res.json(stockData);
    } catch (err) {
        console.error('Error reading stock data file', err);
        res.status(500).json({ message: 'Failed to read stock data file' });
    }
});


// run well
// router.post('/liquor/update-stock', async (req, res) => {
//     const { quantityDifferences } = req.body;

//     try {
//       // Update stock quantities for each item
//       for (const [itemName, quantityChange] of Object.entries(quantityDifferences)) {
//         const liquorBrand = await LiquorBrand.findOne({
//           'childMenus.name': itemName,
//         });

//         if (liquorBrand) {
//           const childMenu = liquorBrand.childMenus.find(
//             (menu) => menu.name === itemName
//           );

//           if (childMenu) {
//             // Update stock quantity based on the quantityChange
//             if (quantityChange < 0) {
//               // Increase stock if quantity is decreased
//               childMenu.stockQty += Math.abs(quantityChange);
//               if (childMenu.stockQtyMl !== undefined) {
//                 const ml = parseInt(childMenu.barCategory.replace('ml', ''));
//                 childMenu.stockQtyMl += Math.abs(quantityChange) * ml;
//               }
//             } else {
//               // Decrease stock if quantity is increased
//               childMenu.stockQty -= quantityChange;
//               if (childMenu.stockQtyMl !== undefined) {
//                 const ml = parseInt(childMenu.barCategory.replace('ml', ''));
//                 childMenu.stockQtyMl -= quantityChange * ml;
//               }
//             }

//             // Update the stockQtyStr
//             childMenu.stockQtyStr = `${childMenu.stockQtyMl} ml`;
//           }

//           await liquorBrand.save();
//         }
//       }

//       res.status(200).send({ message: 'Stock quantities updated successfully.' });
//     } catch (error) {
//       console.error('Error updating stock quantities:', error);
//       res.status(500).send({ error: 'An error occurred while updating stock quantities.' });
//     }
//   });



// router.post('/liquor/update-stock', async (req, res) => {
//     const { quantityDifferences } = req.body;
//     console.log(quantityDifferences)

//     try {
//         // Update stock quantities for each item
//         for (const [itemName, quantityChange] of Object.entries(quantityDifferences)) {
//             const liquorBrand = await LiquorBrand.findOne({
//                 'childMenus.name': itemName,
//             });

//             if (liquorBrand) {
//                 const childMenu = liquorBrand.childMenus.find(
//                     (menu) => menu.name === itemName
//                 );

//                 if (childMenu) {
//                     // Update stock quantity based on the quantityChange
//                     if (quantityChange < 0) {
//                         // Increase stock if quantity is decreased
//                         childMenu.stockQty += Math.abs(quantityChange);
//                         if (childMenu.stockQtyMl !== undefined) {
//                             const ml = parseInt(childMenu.barCategory.replace('ml', ''));
//                             childMenu.stockQtyMl += Math.abs(quantityChange) * ml;
//                         }
//                     } else {
//                         // Decrease stock if quantity is increased
//                         childMenu.stockQty -= Math.abs(quantityChange);
//                         if (childMenu.stockQtyMl !== undefined) {
//                             const ml = parseInt(childMenu.barCategory.replace('ml', ''));
//                             childMenu.stockQtyMl -= Math.abs(quantityChange) * ml;
//                         }
//                     }

//                     // Update the stockQtyStr
//                     const barCategoryMl = parseInt(childMenu.barCategory.replace('ml', ''));
//                     if (barCategoryMl !== 0) {
//                         childMenu.stockQty = Math.floor(childMenu.stockQtyMl / barCategoryMl);
//                         const remainingMl = childMenu.stockQtyMl % barCategoryMl;
//                         if (remainingMl > 0) {
//                             childMenu.stockQtyStr = `${childMenu.stockQty}.${remainingMl}`;
//                         } else {
//                             childMenu.stockQtyStr = `${childMenu.stockQty}`;
//                         }
//                     }
//                 }

//                 await liquorBrand.save();
//             }
//         }

//         res.status(200).send({ message: 'Stock quantities updated successfully.' });
//     } catch (error) {
//         console.error('Error updating stock quantities:', error);
//         res.status(500).send({ error: 'An error occurred while updating stock quantities.' });
//     }
// });



// Update Stock when edit Bill
router.post('/liquor/update-stock', async (req, res) => {
    const { quantityDifferences } = req.body;
    console.log(quantityDifferences);

    try {
        // Update stock quantities for each item in LiquorBrand
        for (const [itemName, quantityChange] of Object.entries(quantityDifferences)) {
            const liquorBrand = await LiquorBrand.findOne({
                'childMenus.name': itemName,
            });

            if (liquorBrand) {
                const childMenu = liquorBrand.childMenus.find(
                    (menu) => menu.name === itemName
                );

                if (childMenu) {
                    // Update stock quantity based on the quantityChange
                    if (quantityChange < 0) {
                        // Increase stock if quantity is decreased
                        childMenu.stockQty += Math.abs(quantityChange);
                        if (childMenu.stockQtyMl !== undefined) {
                            const ml = parseInt(childMenu.barCategory.replace('ml', ''));
                            childMenu.stockQtyMl += Math.abs(quantityChange) * ml;
                        }
                    } else {
                        // Decrease stock if quantity is increased
                        childMenu.stockQty -= Math.abs(quantityChange);
                        if (childMenu.stockQtyMl !== undefined) {
                            const ml = parseInt(childMenu.barCategory.replace('ml', ''));
                            childMenu.stockQtyMl -= Math.abs(quantityChange) * ml;
                        }
                    }

                    // Update the stockQtyStr
                    const barCategoryMl = parseInt(childMenu.barCategory.replace('ml', ''));
                    if (barCategoryMl !== 0) {
                        childMenu.stockQty = Math.floor(childMenu.stockQtyMl / barCategoryMl);
                        const remainingMl = childMenu.stockQtyMl % barCategoryMl;
                        if (remainingMl > 0) {
                            childMenu.stockQtyStr = `${childMenu.stockQty}.${remainingMl}`;
                        } else {
                            childMenu.stockQtyStr = `${childMenu.stockQty}`;
                        }
                    }
                }

                await liquorBrand.save();
            }

            // Update stock quantities for each item in LiquorCategory
            const liquorCategory = await LiquorCategory.findOne({
                'brands.prices.name': itemName,
            });

            if (liquorCategory) {
                for (const brand of liquorCategory.brands) {
                    const price = brand.prices.find(
                        (p) => p.name === itemName
                    );

                    if (price) {
                        // Update stock quantity based on the quantityChange
                        if (quantityChange < 0) {
                            // Increase stock if quantity is decreased
                            price.stockQty += Math.abs(quantityChange);
                            if (price.stockQtyMl !== undefined) {
                                const ml = parseInt(price.barCategory.replace('ml', ''));
                                price.stockQtyMl += Math.abs(quantityChange) * ml;
                            }
                        } else {
                            // Decrease stock if quantity is increased
                            price.stockQty -= Math.abs(quantityChange);
                            if (price.stockQtyMl !== undefined) {
                                const ml = parseInt(price.barCategory.replace('ml', ''));
                                price.stockQtyMl -= Math.abs(quantityChange) * ml;
                            }
                        }

                        // Update the stockQtyStr
                        const barCategoryMl = parseInt(price.barCategory.replace('ml', ''));
                        if (barCategoryMl !== 0) {
                            price.stockQty = Math.floor(price.stockQtyMl / barCategoryMl);
                            const remainingMl = price.stockQtyMl % barCategoryMl;
                            if (remainingMl > 0) {
                                price.stockQtyStr = `${price.stockQty}.${remainingMl}`;
                            } else {
                                price.stockQtyStr = `${price.stockQty}`;
                            }
                        }
                    }
                }

                await liquorCategory.save();
            }
        }

        res.status(200).send({ message: 'Stock quantities updated successfully.' });
    } catch (error) {
        console.error('Error updating stock quantities:', error);
        res.status(500).send({ error: 'An error occurred while updating stock quantities.' });
    }
});






module.exports = router;