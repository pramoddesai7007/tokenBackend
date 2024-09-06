const express = require('express');
const Menu = require('../models/Menu');
const Item = require('../models/Item');
const MainCategory = require('../models/MainCategory');
const { upload } = require('../multerConfig');
const router = express.Router();
const xlsx = require('xlsx'); // Add this line




// Fetch menu names from both collections
// router.get('/menus/stockQty', async (req, res) => {
//     try {
//       const commonMenuNames = await Menu.aggregate([
//         {
//           $lookup: {
//             from: "items",
//             localField: "name",
//             foreignField: "itemName",
//             as: "matchedItems"
//           }
//         },
//         {
//           $match: {
//             matchedItems: { $exists: true, $not: { $size: 0 } }
//           }
//         },
//         {
//           $group: {
//             _id: null,
//             menuNames: { $addToSet: "$name" }
//           }
//         },
//         {
//           $project: {
//             _id: 0,
//             menuNames: 1
//           }
//         }
//       ]);
  
//       if (commonMenuNames.length > 0) {
//         res.json(commonMenuNames[0].menuNames);
//       } else {
//         res.json([]);
//       }
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   });


// Fetch menu names with opening stock from both collections
// Fetch menu names with opening stock and purchased quantity
// router.get('/menus/stockQty', async (req, res) => {
//     try {
//       const commonMenuNames = await Menu.aggregate([
//         {
//           $lookup: {
//             from: "items",
//             localField: "name",
//             foreignField: "itemName",
//             as: "matchedItems"
//           }
//         },
//         {
//           $match: {
//             matchedItems: { $exists: true, $not: { $size: 0 } }
//           }
//         },
//         {
//           $lookup: {
//             from: "purchases",
//             localField: "name",
//             foreignField: "items.productName",
//             as: "relatedPurchases"
//           }
//         },
//         {
//           $unwind: "$relatedPurchases"
//         },
//         {
//           $group: {
//             _id: "$_id",
//             name: { $first: "$name" },
//             stockQty: { $first: "$stockQty" },
//             purchasedQuantity: { $sum: "$relatedPurchases.items.quantity" }
//           }
//         },
//         {
//           $project: {
//             name: 1,
//             stockQty: 1,
//             purchasedQuantity: 1,
//             openingStock: "$stockQty",
//             closingStock: { $subtract: ["$stockQty", "$purchasedQuantity"] }
//           }
//         }
//       ]);
  
//       if (commonMenuNames.length > 0) {
//         res.json(commonMenuNames);
//       } else {
//         res.json([]);
//       }
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   });
    

// router.get('/menus/stockQty', async (req, res) => {
//     try {
//       // Get the current date
//       const currentDate = new Date();
  
//       // Extract the date part from the current date
//       const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
//       const commonMenuNames = await Menu.aggregate([
//         {
//           $lookup: {
//             from: "items",
//             localField: "name",
//             foreignField: "itemName",
//             as: "matchedItems"
//           }
//         },
//         {
//           $match: {
//             matchedItems: { $exists: true, $not: { $size: 0 } }
//           }
//         },
//         {
//           $lookup: {
//             from: "purchases",
//             let: { menuName: "$name" },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: {
//                     $and: [
//                       { $eq: ["$$menuName", "$items.productName"] },
//                       { $gte: ["$date", currentDay] },
//                       { $lt: ["$date", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
//                     ]
//                   }
//                 }
//               }
//             ],
//             as: "relatedPurchases"
//           }
//         },
//         {
//           $group: {
//             _id: "$_id",
//             name: { $first: "$name" },
//             stockQty: { $first: "$stockQty" },
//             purchasedQuantity: { $sum: { $ifNull: ["$relatedPurchases.items.quantity", 0] } }
//           }
//         },
//         {
//           $project: {
//             name: 1,
//             stockQty: 1,
//             purchasedQuantity: 1,
//             openingStock: "$stockQty",
//             closingStock: { $subtract: ["$stockQty", "$purchasedQuantity"] }
//           }
//         }
//       ]);
  
//       if (commonMenuNames.length > 0) {
//         res.json(commonMenuNames);
//       } else {
//         res.json([]);
//       }
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   });
  


// router.get('/menus/stockQty', async (req, res) => {
//     try {
//         // Get the current date
//         const currentDate = new Date();

//         // Extract the date part from the current date
//         const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

//         const commonMenuNames = await Menu.aggregate([
//             {
//                 $lookup: {
//                     from: "items",
//                     localField: "name",
//                     foreignField: "itemName",
//                     as: "matchedItems"
//                 }
//             },
//             {
//                 $match: {
//                     matchedItems: { $exists: true, $not: { $size: 0 } }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "purchases",
//                     let: { menuName: "$name" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$$menuName", "$items.productName"] },
//                                         { $gte: ["$date", currentDay] },
//                                         { $lt: ["$date", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "relatedPurchases"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "orders",
//                     let: { menuName: "$name" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$$menuName", "$items.name"] },
//                                         { $gte: ["$createdAt", currentDay] },
//                                         { $lt: ["$createdAt", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$items"
//                         },
//                         {
//                             $group: {
//                                 _id: null,
//                                 totalSoldQuantity: { $sum: "$items.quantity" }
//                             }
//                         }
//                     ],
//                     as: "totalSold"
//                 }
//             },
//             {
//                 $addFields: {
//                     totalSoldQuantity: { $sum: "$totalSold.totalSoldQuantity" }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     name: { $first: "$name" },
//                     stockQty: { $first: "$stockQty" },
//                     purchasedQuantity: { $sum: { $ifNull: ["$relatedPurchases.items.quantity", 0] } },
//                     totalSoldQuantity: { $first: "$totalSoldQuantity" }
//                 }
//             },
//             {
//                 $project: {
//                     name: 1,
//                     stockQty: 1,
//                     purchasedQuantity: 1,
//                     totalSoldQuantity: 1,
//                     openingStock: "$stockQty",
//                     closingStock: { $subtract: ["$stockQty", { $add: ["$purchasedQuantity", "$totalSoldQuantity"] }] }
//                 }
//             }
//         ]);

//         if (commonMenuNames.length > 0) {
//             res.json(commonMenuNames);
//         } else {
//             res.json([]);
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


// router.get('/menus/stockQty', async (req, res) => {
//     try {
//         // Get the current date
//         const currentDate = new Date();

//         // Extract the date part from the current date
//         const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

//         const commonMenuNames = await Menu.aggregate([
//             {
//                 $lookup: {
//                     from: "items",
//                     localField: "name",
//                     foreignField: "itemName",
//                     as: "matchedItems"
//                 }
//             },
//             {
//                 $match: {
//                     matchedItems: { $exists: true, $not: { $size: 0 } }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "purchases",
//                     let: { menuName: "$name" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$$menuName", "$items.productName"] },
//                                         { $gte: ["$date", currentDay] },
//                                         { $lt: ["$date", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
//                                     ]
//                                 }
//                             }
//                         }
//                     ],
//                     as: "relatedPurchases"
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "orders",
//                     let: { menuName: "$name" },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ["$$menuName", { $arrayElemAt: ["$items.name", 0] }] },
//                                         { $gte: ["$createdAt", currentDay] },
//                                         { $lt: ["$createdAt", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
//                                     ]
//                                 }
//                             }
//                         },
//                         {
//                             $unwind: "$items"
//                         },
//                         {
//                             $match: {
//                                 $expr: {
//                                     $eq: ["$items.name", "$$menuName"]
//                                 }
//                             }
//                         },
//                         {
//                             $group: {
//                                 _id: null,
//                                 totalSoldQuantity: { $sum: "$items.quantity" }
//                             }
//                         }
//                     ],
//                     as: "totalSold"
//                 }
//             },
//             {
//                 $addFields: {
//                     totalSoldQuantity: { $sum: "$totalSold.totalSoldQuantity" }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$_id",
//                     name: { $first: "$name" },
//                     stockQty: { $first: "$stockQty" },
//                     purchasedQuantity: { $sum: { $ifNull: ["$relatedPurchases.items.quantity", 0] } },
//                     totalSoldQuantity: { $first: "$totalSoldQuantity" }
//                 }
//             },
//             {
//                 $project: {
//                     name: 1,
//                     stockQty: 1,
//                     purchasedQuantity: 1,
//                     totalSoldQuantity: 1,
//                     openingStock: "$stockQty",
//                     closingStock: { $subtract: ["$stockQty", { $add: ["$purchasedQuantity", "$totalSoldQuantity"] }] }
//                 }
//             }
//         ]);

//         if (commonMenuNames.length > 0) {
//             res.json(commonMenuNames);
//         } else {
//             res.json([]);
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


router.get('/menus/stockQty', async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();

        // Extract the date part from the current date
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        const commonMenuNames = await Menu.aggregate([
            {
                $lookup: {
                    from: "items",
                    localField: "name",
                    foreignField: "itemName",
                    as: "matchedItems"
                }
            },
            {
                $match: {
                    matchedItems: { $exists: true, $not: { $size: 0 } }
                }
            },
            {
                $lookup: {
                    from: "purchases",
                    let: { menuName: "$name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$$menuName", "$items.productName"] },
                                        { $gte: ["$date", currentDay] },
                                        { $lt: ["$date", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "relatedPurchases"
                }
            },
            {
                $lookup: {
                    from: "orders",
                    let: { menuName: "$name" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$$menuName", { $arrayElemAt: ["$items.name", 0] }] },
                                        { $gte: ["$createdAt", currentDay] },
                                        { $lt: ["$createdAt", new Date(currentDay.getTime() + 24 * 60 * 60 * 1000)] }
                                    ]
                                }
                            }
                        },
                        {
                            $unwind: "$items"
                        },
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$items.name", "$$menuName"]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalSoldQuantity: { $sum: "$items.quantity" }
                            }
                        }
                    ],
                    as: "totalSold"
                }
            },
            {
                $addFields: {
                    totalSoldQuantity: { $sum: "$totalSold.totalSoldQuantity" }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    stockQty: { $first: "$stockQty" },
                    purchasedQuantity: { $sum: { $ifNull: ["$relatedPurchases.items.quantity", 0] } },
                    totalSoldQuantity: { $first: "$totalSoldQuantity" }
                }
            },
            {
                $project: {
                    name: 1,
                    stockQty: 1,
                    purchasedQuantity: 1,
                    totalSoldQuantity: 1,
                    openingStock: { $add: ["$stockQty", "$totalSoldQuantity"] },
                    closingStock: { $subtract: ["$stockQty", { $add: ["$purchasedQuantity", "$totalSoldQuantity"] }] }
                }
            }
        ]);

        if (commonMenuNames.length > 0) {
            res.json(commonMenuNames);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




// router.post('/:mainCategoryId/assignmenus', async (req, res) => {
//     const { mainCategoryId } = req.params;
//     const { menuIds } = req.body;

//     try {
//         // Find the MainCategory by ID
//         const mainCategory = await MainCategory.findById(mainCategoryId);

//         if (!mainCategory) {
//             return res.status(404).json({ message: 'MainCategory not found' });
//         }

//         // Filter out menus already associated with other main categories
//         const existingMenus = await MainCategory.find({ 'menus._id': { $in: menuIds } });
//         const menusToAdd = menuIds.filter(menuId => !existingMenus.some(category => category.menus.some(existingMenu => existingMenu._id.equals(menuId))));

//         if (menusToAdd.length === 0) {
//             return res.status(400).json({ message: 'Menus are already associated with other main categories' });
//         }

//         // Find the menus by their IDs
//         const menus = await Menu.find({ _id: { $in: menusToAdd } });

//         // Concatenate the existing menus with the selected menus
//         mainCategory.menus = [...mainCategory.menus, ...menus.map(menu => ({
//             _id: menu._id,
//             name: menu.name,
//             price: menu.price,
//             imageUrl: menu.imageUrl,
//         }))];

//         // Save the updated MainCategory
//         const updatedMainCategory = await mainCategory.save();

//         res.status(200).json(updatedMainCategory);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

router.post('/:mainCategoryId/assignmenus', async (req, res) => {
    const { mainCategoryId } = req.params;
    const { menuIds } = req.body;

    try {
        // Find the MainCategory by ID
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ message: 'MainCategory not found' });
        }

        // Filter out menus already associated with other main categories
        const existingMenus = await MainCategory.find({ 'menus._id': { $in: menuIds } });
        const menusToAdd = menuIds.filter(menuId => !existingMenus.some(category => category.menus.some(existingMenu => existingMenu._id.equals(menuId))));

        if (menusToAdd.length === 0) {
            return res.status(400).json({ message: 'Menus are already associated with other main categories' });
        }

        // Find the menus by their IDs
        const menus = await Menu.find({ _id: { $in: menusToAdd } });

        // Assign the mainCategory to each menu item
        await Promise.all(menus.map(async (menu) => {
            menu.mainCategory = {
                id: mainCategoryId, // Assign the main category ID
                name: mainCategory.name // Assign the main category name
            };
            await menu.save();
        }));

        // Concatenate the existing menus with the selected menus
        mainCategory.menus = [...mainCategory.menus, ...menus.map(menu => ({
            _id: menu._id,
            name: menu.name,
            price: menu.price,
            imageUrl: menu.imageUrl,
            mainCategory: {
                id: mainCategoryId, // Assign the main category ID
                name: mainCategory.name // Assign the main category name
            }
        }))];

        // Save the updated MainCategory
        const updatedMainCategory = await mainCategory.save();

        res.status(200).json(updatedMainCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.get('/:mainCategoryId', async (req, res) => {
    const { mainCategoryId } = req.params;

    try {
        // Find the MainCategory by ID
        const mainCategory = await MainCategory.findById(mainCategoryId);

        if (!mainCategory) {
            return res.status(404).json({ message: 'MainCategory not found' });
        }

        res.status(200).json(mainCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// router.post('/menu', upload.single('image'), async (req, res) => {
//     const { name, price, uniqueId } = req.body;

//     try {
//         // Check if a menu with the same name exists
//         const existingMenuByName = await Menu.findOne({ name: name });

//         if (existingMenuByName) {
//             return res.status(400).json({ message: 'Menu with the same name already exists' });
//         }

//         // Declare existingMenuByUniqueId as undefined initially
//         // const existingMenuByUniqueId = undefined;
//         let existingMenuByUniqueId;

//         // Check if uniqueId is provided, then check if it's unique
//         if (uniqueId) {
//             existingMenuByUniqueId = await Menu.findOne({ uniqueId: uniqueId });

//             if (existingMenuByUniqueId) {
//                 return res.status(400).json({ message: 'Menu with the same uniqueId already exists' });
//             }
//         }

//         // Get the file path (if an image was uploaded)
//         const imageUrl = req.file ? req.file.path : undefined;

//         const newMenu = new Menu({
//             name,
//             price,
//             imageUrl,
//             uniqueId, // Add uniqueId if provided, otherwise it will be undefined
//         });

//         const savedMenu = await newMenu.save();
//         res.status(201).json(savedMenu);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });


router.post('/menu', upload.single('image'), async (req, res) => {
    const { name, price, uniqueId } = req.body;

    try {
        // Check if a menu with the same name exists
        const existingMenuByName = await Menu.findOne({ name: name });

        if (existingMenuByName) {
            return res.status(400).json({ message: 'Menu with the same name already exists' });
        }

        // Check if uniqueId is provided, then check if it's unique
        if (uniqueId) {
            const existingMenuByUniqueId = await Menu.findOne({ uniqueId: uniqueId });

            if (existingMenuByUniqueId) {
                return res.status(400).json({ message: 'Menu with the same uniqueId already exists' });
            }
        }

        // Get the file path (if an image was uploaded)
        const imageUrl = req.file ? req.file.path : undefined;

        const newMenuData = {
            name,
            price,
            imageUrl,
        };

        // Only add uniqueId to the newMenuData if provided by the user
        if (uniqueId) {
            newMenuData.uniqueId = uniqueId;
        }

        const newMenu = new Menu(newMenuData);
        const savedMenu = await newMenu.save();
        res.status(201).json(savedMenu);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// Add a new route for deleting menus from the selected category
router.delete('/:mainCategoryId/removemenus', async (req, res) => {
    const { mainCategoryId } = req.params;
    const { menuIds } = req.body;

    try {
        // Find the MainCategory by ID
        const mainCategory = await MainCategory.findById(mainCategoryId);

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


// router.patch('/menus/:menuId', upload.single('image'), async (req, res) => {
//     const { menuId } = req.params;
//     const { name, price, uniqueId } = req.body;
  
//     try {
//       const existingMenu = await Menu.findOne({ uniqueId });
//       if (existingMenu && existingMenu._id.toString() !== menuId) {
//         // Duplicate uniqueId found
//         return res.status(400).json({ error: 'Menu with the same uniqueId already exists' });
//       }
  
//       const updatedMenu = await Menu.findByIdAndUpdate(
//         menuId,
//         {
//           name,
//           price,
//           uniqueId,
//           ...(req.file && { imageUrl: req.file.path }), // Update image if provided
//         },
//         { new: true } // Return the updated document
//       );
  
//       res.status(200).json(updatedMenu);
//     } catch (err) {
//       if (err.name === 'MongoError' && err.code === 11000 && err.keyPattern && err.keyPattern.uniqueId === 1) {
//         // Duplicate key error (uniqueId)
//         return res.status(400).json({ error: 'Menu with the same uniqueId already exists' });
//       }
//       res.status(400).json({ error: err.message });
//     }
//   });
router.patch('/menus/:menuId', upload.single('image'), async (req, res) => {
    const { menuId } = req.params;
    const { name, price, uniqueId } = req.body;
  
    try {
      const existingMenu = await Menu.findOne({ uniqueId });
      if (existingMenu && existingMenu._id.toString() !== menuId) {
        // Duplicate uniqueId found
        return res.status(400).json({ error: 'Menu with the same uniqueId already exists' });
      }
  
      const updatedMenu = await Menu.findByIdAndUpdate(
        menuId,
        {
          name,
          price,
          uniqueId,
          ...(req.file && { imageUrl: req.file.path }), // Update image if provided
        },
        { new: true } // Return the updated document
      );
  
      // Find all main categories where this menu is present
      const mainCategories = await MainCategory.find({ 'menus._id': menuId });

      // Update price in each main category
      for (const mainCategory of mainCategories) {
        const menuIndex = mainCategory.menus.findIndex(menu => menu._id.toString() === menuId);
        if (menuIndex !== -1) {
          mainCategory.menus[menuIndex].price = price;
          await mainCategory.save();
        }
      }

      res.status(200).json(updatedMenu);
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000 && err.keyPattern && err.keyPattern.uniqueId === 1) {
        // Duplicate key error (uniqueId)
        return res.status(400).json({ error: 'Menu with the same uniqueId already exists' });
      }
      res.status(400).json({ error: err.message });
    }
});
  

// Delete menus API 
router.delete('/menus/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const menuToDelete = await Menu.findByIdAndDelete(id);

        if (!menuToDelete) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        const mainCategoryId = menuToDelete.mainCategory ? menuToDelete.mainCategory._id : null;

        // If the menu was associated with a main category, remove menu reference from main category
        if (mainCategoryId) {
            const mainCategory = await MainCategory.findById(mainCategoryId);

            if (mainCategory) {
                mainCategory.menus = mainCategory.menus.filter(
                    (menu) => menu._id.toString() !== id.toString()
                );
                await mainCategory.save();
            }
        }

        res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Get ALl menus
router.get('/menus/list', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Get Single Menu API
router.get('/menus/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const menu = await Menu.findById(id);

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        res.json(menu);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




router.get('/menulist/:id', async (req, res) => {
    try {
        const mainCategoryId = req.params.id;
        const menus = await Menu.find({ 'mainCategory.id': mainCategoryId });
        res.json(menus);
    } catch (error) {
        console.error('Error fetching menus:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Assuming your Excel sheet has columns named 'name' and 'price'
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        // Save the data to MongoDB's menu collection
        const savedMenus = await Menu.create(jsonData);

        res.status(200).json({ message: 'Data uploaded successfully', savedMenus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router