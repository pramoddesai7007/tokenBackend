const express = require("express");
const router = express.Router();
const BarPurchase = require("../models/BarPurchase");
const LiquorBrand = require("../models/LiquorBrand");
const LiquorCategory = require("../models/LiquorCategory");
const Order = require("../models/Order");


router.get("/purchase/stockQty", async (req, res) => {
  try {
    const name = req.query.name;
    console.log("Product Name:", name); // Log productName for debugging

    // Find the bar purchase containing the productName
    const barPurchase = await BarPurchase.findOne({
      "items.name": { $regex: new RegExp("^" + name + "$", "i") },
    });

    // If the bar purchase is not found, or the productName within items is not found, return a 404 error
    if (!barPurchase) {
      return res
        .status(404)
        .json({ error: "Product name not found in BarPurchase" });
    }

    // Find the corresponding item within the bar purchase
    const item = barPurchase.items.find((item) =>
      item.name.match(new RegExp("^" + name + "$", "i"))
    );

    // If the item is not found, return a 404 error
    if (!item) {
      return res
        .status(404)
        .json({ error: "Product name not found in BarPurchase" });
    }

    // Find the liquor brand in the database based on the item name
    const liquorBrand = await LiquorBrand.findOne({
      name: { $regex: new RegExp("^" + item.name + "$", "i") },
    });

    // If the liquor brand is not found, return a 404 error
    if (!liquorBrand) {
      return res.status(404).json({ error: "Liquor brand not found" });
    }

    // Return the stock quantity of the liquor brand
    res.json({ name: liquorBrand.name, stockQty: liquorBrand.stockQty });
  } catch (error) {
    console.error("Error fetching stock quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// POST route to add an item to a bar purchase
router.post("/bar/purchase/addItem", async (req, res) => {
  try {
    const { billNo, productName, quantity, unit, pricePerQty, vat } = req.body;

    // Find the existing bar purchase or create a new one
    let barPurchase = await BarPurchase.findOne({ billNo });

    if (!barPurchase) {
      barPurchase = new BarPurchase({
        billNo,
        items: [],
        subtotal: 0,
        vatAmount: 0,
        paidAmount: 0,
        handleAmount: 0,
        frightAmount: 0,
      });
    }

    // Calculate GST amount for the new item
    const vatAmount = (parseFloat(quantity) * parseFloat(pricePerQty) * parseFloat(vat)) / 100;

    // Find the corresponding item in the LiquorBrand collection
    const liquorBrandItem = await LiquorBrand.findOne({ name: productName });

    if (liquorBrandItem) {
      // Adjust stock quantity for LiquorBrand item
      liquorBrandItem.stockQty += parseFloat(quantity);
      await liquorBrandItem.save();
    } else {
      return res.status(404).json({ error: "Item not found in LiquorBrand" });
    }

    // Add the new item to the items array
    barPurchase.items.push({
      name: productName,
      quantity,
      unit,
      pricePerQty,
      vat,
      vatAmount: 0, // Assuming VAT amount is not provided
      salePrice: 0, // Assuming sale price is not provided
      mrp: 0, // Assuming MRP is not provided
      cases: 0, // Assuming cases are not provided
      size: "", // Assuming size is not provided
      purchasePrice: 0, // Assuming purchase price is not provided
      bottlePrice: 0, // Assuming bottle price is not provided
    });

    // Update subtotal based on the new item
    barPurchase.subtotal += parseFloat(quantity) * parseFloat(pricePerQty);

    // Save the updated bar purchase
    const savedBarPurchase = await barPurchase.save();
    res.json(savedBarPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// router.post("/bar/purchase/savebill", async (req, res) => {
//   try {
//     const {
//       date,
//       billNo,
//       vendor,
//       subtotal,
//       vat,
//       vatAmount,
//       grandTotal,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     } = req.body;

//     // Check if a bar purchase with the same billNo already exists
//     const existingBarPurchase = await BarPurchase.findOne({ billNo });
//     if (existingBarPurchase) {
//       return res.status(400).json({ error: "Duplicate bill number" });
//     }

//     // Iterate through purchased items to update stock quantity and stock quantity in milliliters
//     for (const item of items) {
//       console.log(item);
//       const qty = parseFloat(item.quantity);
//       const stockQtyMl = qty * parseInt(item.barCategory?.replace('ml', '') || 0);
  
//       const updateObj = {
//           $inc: {
//               "childMenus.$.stockQty": qty,
//               "childMenus.$.stockQtyMl": stockQtyMl
//           }
//       };
  
//       const liquorBrand = await LiquorBrand.findOneAndUpdate(
//           { "childMenus.name": item.name },
//           updateObj,
//           { new: true }
//       );
  
//       if (!liquorBrand) {
//           console.log(`Child menu not found for item ${item.name}`);
//           return res.status(404).json({ error: `Child menu not found for item ${item.name}` });
//       }



//   }


//     // Create the bar purchase
//     const barPurchase = new BarPurchase({
//       date,
//       billNo,
//       vendorName: vendor,
//       subtotal,
//       grandTotal,
//       vat,
//       vatAmount,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     });

//     // Save the bar purchase
//     const savedBarPurchase = await barPurchase.save();
//     res.json(savedBarPurchase);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });







// router.post("/bar/purchase/savebill", async (req, res) => {
//   try {
//     const {
//       date,
//       billNo,
//       vendor,
//       subtotal,
//       vat,
//       vatAmount,
//       grandTotal,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     } = req.body;

//     // Check if a bar purchase with the same billNo already exists
//     // const existingBarPurchase = await BarPurchase.findOne({ billNo });
//     // if (existingBarPurchase) {
//     //   return res.status(400).json({ error: "Duplicate bill number" });
//     // }


//     // Iterate through purchased items to update stock quantity and stock quantity in milliliters
//     for (const item of items) {
//       console.log(item);
//       const qty = parseFloat(item.quantity);
//       const stockQtyMl = qty * parseInt(item.barCategory?.replace('ml', '') || 0);
  
//       const updateObj = {
//         $inc: {
//           "childMenus.$.stockQty": qty,
//           "childMenus.$.stockQtyMl": stockQtyMl
//         }
//       };

//       // Update stockQty in liquorBrand collection
//       const liquorBrand = await LiquorBrand.findOneAndUpdate(
//         { "childMenus.name": item.name },
//         updateObj,
//         { new: true }
//       );

//       if (!liquorBrand) {
//         console.log(`Child menu not found for item ${item.name}`);
//         return res.status(404).json({ error: `Child menu not found for item ${item.name}` });
//       }

//       // Update stockQty in liquorCategory collection
//       const liquorCategoryUpdate = await LiquorCategory.updateOne(
//         { "brands.prices.name": item.name },
//         {
//           $inc: {
//             "brands.$[brand].prices.$[price].stockQty": qty,
//             "brands.$[brand].prices.$[price].stockQtyMl": stockQtyMl
//           }
//         },
//         {
//           arrayFilters: [
//             { "brand.prices.name": item.name },
//             { "price.name": item.name, "price.barCategory": item.barCategory }
//           ]
//         }
//       );

//       // if (!liquorCategoryUpdate.nModified) {
//       //   console.log(`Price not found for item ${item.name}`);
//       //   return res.status(404).json({ error: `Price not found for item ${item.name}` });
//       // }
//     }

//     // Create the bar purchase
//     const barPurchase = new BarPurchase({
//       date,
//       billNo,
//       vendorName: vendor,
//       subtotal,
//       grandTotal,
//       vat,
//       vatAmount,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     });

//     // Save the bar purchase
//     const savedBarPurchase = await barPurchase.save();
//     res.json(savedBarPurchase);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// router.post("/bar/purchase/savebill", async (req, res) => {
//   try {
//     const {
//       date,
//       billNo,
//       vendor,
//       subtotal,
//       vat,
//       vatAmount,
//       grandTotal,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     } = req.body;

//     // Check if a bar purchase with the same billNo and vendor already exists
//     const existingBarPurchase = await BarPurchase.findOne({ billNo, vendorName: vendor });
//     if (existingBarPurchase) {
//       return res.status(400).json({ error: "Duplicate bill number for the same vendor" });
//     }

//     // Iterate through purchased items to update stock quantity and stock quantity in milliliters
//     for (const item of items) {
//       console.log(item);
//       const qty = parseFloat(item.quantity);
//       const barCategoryMl = parseInt(item.barCategory?.replace('ml', '') || 0);
//       const stockQtyMl = qty * barCategoryMl;

//       // Calculate stockQty and stockQtyStr
//       let stockQtyStr = '';
//       if (barCategoryMl !== 0) {
//         const stockQty = Math.floor(stockQtyMl / barCategoryMl);
//         const remainingMl = stockQtyMl % barCategoryMl;
//         stockQtyStr = remainingMl > 0 ? `${stockQty}.${remainingMl}` : `${stockQty}`;
//       }

//       const updateObj = {
//         $inc: {
//           "childMenus.$.stockQty": qty,
//           "childMenus.$.stockQtyMl": stockQtyMl,
//         },
//         $set: {
//           "childMenus.$.stockQtyStr": stockQtyStr,
//         },
//       };

//       // Update stockQty in liquorBrand collection
//       const liquorBrand = await LiquorBrand.findOneAndUpdate(
//         { "childMenus.name": item.name },
//         updateObj,
//         { new: true }
//       );

//       if (!liquorBrand) {
//         console.log(`Child menu not found for item ${item.name}`);
//         return res.status(404).json({ error: `Child menu not found for item ${item.name}` });
//       }

//       // Update stockQty in liquorCategory collection
//       const liquorCategoryUpdate = await LiquorCategory.updateOne(
//         { "brands.prices.name": item.name },
//         {
//           $inc: {
//             "brands.$[brand].prices.$[price].stockQty": qty,
//             "brands.$[brand].prices.$[price].stockQtyMl": stockQtyMl,
//           },
//           $set: {
//             "brands.$[brand].prices.$[price].stockQtyStr": stockQtyStr,
//           },
//         },
//         {
//           arrayFilters: [
//             { "brand.prices.name": item.name },
//             { "price.name": item.name, "price.barCategory": item.barCategory },
//           ],
//         }
//       );

//       // if (!liquorCategoryUpdate.nModified) {
//       //   console.log(`Price not found for item ${item.name}`);
//       //   return res.status(404).json({ error: `Price not found for item ${item.name}` });
//       // }
//     }

//     // Create the bar purchase
//     const barPurchase = new BarPurchase({
//       date,
//       billNo,
//       vendorName: vendor,
//       subtotal,
//       grandTotal,
//       vat,
//       vatAmount,
//       paidAmount,
//       discount,
//       balance,
//       handleAmount,
//       frightAmount,
//       items,
//     });

//     // Save the bar purchase
//     const savedBarPurchase = await barPurchase.save();
//     res.json(savedBarPurchase);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



router.post("/bar/purchase/savebill", async (req, res) => {
  try {
    const {
      date,
      billNo,
      batchNo,
      vendor,
      subtotal,
      vat,
      vatAmount,
      grandTotal,
      paidAmount,
      discount,
      balance,
      handleAmount,
      frightAmount,
      items,
    } = req.body;

    // Check if a bar purchase with the same billNo and vendor already exists
    const existingBarPurchase = await BarPurchase.findOne({ billNo, vendorName: vendor });
    if (existingBarPurchase) {
      return res.status(400).json({ error: "Duplicate bill number for the same vendor" });
    }

    // Iterate through purchased items to update stock quantity and stock quantity in milliliters
    for (const item of items) {
      const qty = parseFloat(item.quantity);
      const barCategoryMl = parseInt(item.barCategory?.replace('ml', '') || 0);
      const stockQtyMl = qty * barCategoryMl;

      // Retrieve current stock quantities from LiquorBrand collection
      const liquorBrand = await LiquorBrand.findOne({ "childMenus.name": item.name });
      if (!liquorBrand) {
        console.log(`Child menu not found for item ${item.name}`);
        return res.status(404).json({ error: `Child menu not found for item ${item.name}` });
      }

      const childMenu = liquorBrand.childMenus.find(menu => menu.name === item.name);
      const currentStockQtyMl = childMenu.stockQtyMl || 0;
      const newStockQtyMl = currentStockQtyMl + stockQtyMl;

      // Calculate stockQty and stockQtyStr
      const stockQty = Math.floor(newStockQtyMl / barCategoryMl);
      const remainingMl = newStockQtyMl % barCategoryMl;
      const stockQtyStr = remainingMl > 0 ? `${stockQty}.${remainingMl}` : `${stockQty}`;

      const updateObj = {
        $inc: {
          "childMenus.$.stockQty": qty,
          "childMenus.$.stockQtyMl": stockQtyMl,
        },
        $set: {
          "childMenus.$.stockQtyStr": stockQtyStr,
        },
      };

      // Update stock quantities in LiquorBrand collection
      const liquorBrandUpdate = await LiquorBrand.updateOne(
        { "childMenus.name": item.name },
        updateObj
      );

      // if (!liquorBrandUpdate.nModified) {
      //   console.log(`Failed to update stock for item ${item.name} in LiquorBrand`);
      //   return res.status(500).json({ error: `Failed to update stock for item ${item.name} in LiquorBrand` });
      // }

      // Update stock quantities in LiquorCategory collection
      const liquorCategoryUpdate = await LiquorCategory.updateOne(
        { "brands.prices.name": item.name },
        {
          $inc: {
            "brands.$[brand].prices.$[price].stockQty": qty,
            "brands.$[brand].prices.$[price].stockQtyMl": stockQtyMl,
          },
          $set: {
            "brands.$[brand].prices.$[price].stockQtyStr": stockQtyStr,
          },
        },
        {
          arrayFilters: [
            { "brand.prices.name": item.name },
            { "price.name": item.name, "price.barCategory": item.barCategory },
          ],
        }
      );

      // if (!liquorCategoryUpdate.nModified) {
      //   console.log(`Failed to update stock for item ${item.name} in LiquorCategory`);
      //   return res.status(500).json({ error: `Failed to update stock for item ${item.name} in LiquorCategory` });
      // }
    }

    // Create the bar purchase
    const barPurchase = new BarPurchase({
      date,
      billNo,
      batchNo,
      vendorName: vendor,
      subtotal,
      grandTotal,
      vat,
      vatAmount,
      paidAmount,
      discount,
      balance,
      handleAmount,
      frightAmount,
      items,
    });

    // Save the bar purchase
    const savedBarPurchase = await barPurchase.save();
    res.json(savedBarPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// GET route to retrieve BarPurchase items with item names from LiquorBrand
router.get("/barpurchase/items", async (req, res) => {
  try {
    const barPurchases = await BarPurchase.find().populate(
      "items.name",
      "name"
    );
    const itemNames = barPurchases.reduce((acc, purchase) => {
      purchase.items.forEach((item) => {
        if (item.name && item.name.name) {
          acc.push(item.name.name);
        }
      });
      return acc;
    }, []);
    res.json({ items: itemNames });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET route to retrieve all BarPurchase records
// router.get("/barpurchase/all", async (req, res) => {
//   try {
//     // Fetch all BarPurchase records from the database
//     const barPurchases = await BarPurchase.find();

//     // Return the fetched records
//     res.json(barPurchases);
//   } catch (error) {
//     // Handle errors
//     console.error("Error fetching BarPurchase records:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


// GET route to retrieve BarPurchase records based on startDate, endDate, and vendorName
router.get("/barpurchase/all", async (req, res) => {
  try {
    // Extract startDate, endDate, and vendorName from the query parameters
    const { startDate, endDate, vendorName } = req.query;

    // Construct the query object based on startDate, endDate, and vendorName
    const query = {};
    if (startDate && endDate) {
      // Add conditions to filter by date range
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (vendorName) {
      // Add condition to filter by vendorName
      query.vendorName = vendorName;
    }

    // Fetch BarPurchase records from the database based on the query
    const barPurchases = await BarPurchase.find(query);

    // Return the fetched records
    res.json(barPurchases);
  } catch (error) {
    // Handle errors
    console.error("Error fetching BarPurchase records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get("/purchase/childMenuStockQty", async (req, res) => {
  try {
    const name = req.query.name; // Get child menu name from query parameter

    // Find the liquor brand document containing the child menu with the specified name
    const liquorBrand = await LiquorBrand.findOne({ 'childMenus.name': name });

    if (!liquorBrand) {
      return res.status(404).json({ error: "Child menu not found" });
    }

    // Find the child menu within the childMenus array by name
    const childMenu = liquorBrand.childMenus.find(menu => menu.name === name);

    console.log("Response:", { stockQty: childMenu.stockQty, stockQtyMl: childMenu.stockQtyMl });

    res.json({ stockQty: childMenu.stockQty, stockQtyMl: childMenu.stockQtyMl }); // Return stock quantity and stock quantity in milliliters of the child menu
  } catch (error) {
    console.error("Error fetching child menu stock quantity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get("/barPurchase/items/quantities", async (req, res) => {
  try {
    const selectedDate = req.query.date; // Get the selected date from query parameters

    // Initialize the filter without brandName condition
    const filter = {};

    // If selectedDate is provided, add it to the filter
    if (selectedDate) {
      filter.date = new Date(selectedDate);
    }

    const barPurchases = await BarPurchase.find(filter);

    // Check if there are any purchases for the selected date
    if (barPurchases.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the selected date" });
    }

    // Initialize an object to store the response data
    const responseData = {
      date: selectedDate || "All Dates", // Set the date to "All Dates" if not provided
      totalQuantity: 0,
      items: [],
    };

    // Iterate through each purchase and aggregate item details
    barPurchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        responseData.items.push({
          name: item.name,
          quantity: item.quantity,
          _id: item._id,
        });

        responseData.totalQuantity += item.quantity; // Increment totalQuantity
      });
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching item quantities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



router.get("/items/quantities", async (req, res) => {
  try {
    const dateQuery = req.query.date;
    const selectedDate = dateQuery ? new Date(dateQuery) : null;

    // Fetch all orders and bar purchases for calculating balances
    const orders = await Order.find({});
    const barPurchases = await BarPurchase.find({});

    if (!orders.length && !barPurchases.length) {
      return res.status(404).json({ error: "No orders or bar purchases found" });
    }

    // Initialize an empty object to store items grouped by date
    const itemsByDate = {};

    // Helper function to initialize item data structure
    const initializeItem = () => ({
      purchaseQuantity: 0,
      saleQuantity: 0,
      closingBalance: 0,
      openingBalance: 0,
    });

    // Process all bar purchases
    barPurchases.forEach((purchase) => {
      const purchaseDate = purchase.date.toISOString().split("T")[0]; // Extract YYYY-MM-DD from the date

      if (!itemsByDate[purchaseDate]) {
        itemsByDate[purchaseDate] = {};
      }

      purchase.items.forEach((item) => {
        if (!itemsByDate[purchaseDate][item.name]) {
          itemsByDate[purchaseDate][item.name] = initializeItem();
        }
        itemsByDate[purchaseDate][item.name].purchaseQuantity += item.quantity;
        itemsByDate[purchaseDate][item.name].closingBalance += item.quantity; // Initial closing balance is purchase quantity
      });
    });

    // Process all orders
    orders.forEach((order) => {
      const orderDate = order.orderDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD from the date

      if (!itemsByDate[orderDate]) {
        itemsByDate[orderDate] = {};
      }

      order.items.forEach((item) => {
        if (!itemsByDate[orderDate][item.name]) {
          itemsByDate[orderDate][item.name] = initializeItem();
        }
        itemsByDate[orderDate][item.name].saleQuantity += item.quantity;
        itemsByDate[orderDate][item.name].closingBalance -= item.quantity; // Deduct sale quantity from closing balance
      });
    });

    // Sort dates to calculate opening balances correctly
    const sortedDates = Object.keys(itemsByDate).sort();

    // Object to hold the latest closing balance of each item
    const latestClosingBalance = {};

    // Calculate opening balances and propagate closing balances
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];

      Object.keys(itemsByDate[currentDate]).forEach((itemName) => {
        if (latestClosingBalance[itemName] !== undefined) {
          itemsByDate[currentDate][itemName].openingBalance = latestClosingBalance[itemName];
        } else {
          itemsByDate[currentDate][itemName].openingBalance = 0;
        }
        itemsByDate[currentDate][itemName].closingBalance =
          itemsByDate[currentDate][itemName].openingBalance +
          itemsByDate[currentDate][itemName].purchaseQuantity -
          itemsByDate[currentDate][itemName].saleQuantity;

        // Update the latest closing balance
        latestClosingBalance[itemName] = itemsByDate[currentDate][itemName].closingBalance;
      });
    }

    // Format the response
    const response = {};
    Object.keys(itemsByDate).forEach((date) => {
      response[date] = {
        totalPurchaseQuantity: 0,
        totalSaleQuantity: 0,
        items: [],
      };

      Object.keys(itemsByDate[date]).forEach((itemName) => {
        const item = itemsByDate[date][itemName];
        response[date].totalPurchaseQuantity += item.purchaseQuantity;
        response[date].totalSaleQuantity += item.saleQuantity;
        response[date].items.push({
          name: itemName,
          purchaseQuantity: item.purchaseQuantity,
          saleQuantity: item.saleQuantity,
          closingBalance: item.closingBalance,
          openingBalance: item.openingBalance,
        });
      });
    });

    // If a specific date is selected, filter the response based on that date
    const filteredResponse = selectedDate
      ? {
          [selectedDate.toISOString().split("T")[0]]:
            response[selectedDate.toISOString().split("T")[0]],
        }
      : response;

    res.json(filteredResponse);
  } catch (error) {
    console.error("Error fetching item quantities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
