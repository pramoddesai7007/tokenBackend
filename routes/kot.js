// routes/kot.js

const express = require('express');
const router = express.Router();
const KOT = require('../models/KOT');
const BOT = require('../models/BOT');
const Order = require('../models/Order');


router.post('/kotOrder/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { itemsWithoutBarCategory = [], waiterName, } = req.body;

    const modifiedItems = itemsWithoutBarCategory.map(item => ({
      name: item.name,
      quantity: item.quantity,
      taste: item.taste || '', // Set the taste information, or default to an empty string
    }));

    const currentDate = new Date();


    // If the current time is before 6 AM, set the order date to yesterday
    if (currentDate.getHours() >= 3) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Set the date to yesterday
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    // Adjust the time to be 5.5 hours ahead
    previousDate.setHours(previousDate.getHours() + 5); // Add 5 hours
    previousDate.setMinutes(previousDate.getMinutes() + 30); // Add 30 minutes


    const newKOT = new KOT({
      tableId,
      itemsWithoutBarCategory: modifiedItems,
      waiterName,
      createdAt: previousDate,
      KOTDate: previousDate
    });

    const savedKOT = await newKOT.save();

    res.json(savedKOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/items/quantity', async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format

    // Aggregate to find top 4 items with the highest total quantity for the current date
    const result = await KOT.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentDateString), // Start of the current date
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // End of the current date
          }


        }
      },
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $group: {
          _id: '$itemsWithoutBarCategory.name',
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $sort: { totalQuantity: -1 } // Sort by total quantity in descending order
      },
      {
        $limit: 4 // Get the top 4 items
      }
    ]);

    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get('/items', async (req, res) => {
  try {
    const result = await KOT.aggregate([
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $match: { 'itemsWithoutBarCategory.isCanceled': false } // Filter out only items where isCanceled is false
      },
      {
        $group: {
          _id: {
            name: '$itemsWithoutBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.name',
          date: '$_id.date',
          totalQuantity: 1
        }
      }
    ]);
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// cancel kot report
router.get('/cancel-items', async (req, res) => {
  try {
    const result = await KOT.aggregate([
      {
        $unwind: '$itemsWithoutBarCategory'
      },
      {
        $match: { 'itemsWithoutBarCategory.isCanceled': true } // Filter out only canceled items
      },
      {
        $group: {
          _id: {
            name: '$itemsWithoutBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithoutBarCategory.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.name',
          date: '$_id.date',
          totalQuantity: 1
        }
      }
    ]);
    res.json({ canceledItems: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/kot/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find the latest KOT for the specified table
    const kot = await KOT.findOne({ tableId }).sort({ createdAt: -1 });

    if (!kot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    // Filter out canceled items
    const itemsNotCanceled = kot.itemsWithoutBarCategory.filter(item => !item.isCanceled);

    // Construct a new KOT object with only non-canceled items
    const kotFiltered = {
      ...kot.toObject(),
      itemsWithoutBarCategory: itemsNotCanceled
    };

    res.status(200).json(kotFiltered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.patch('/kot/settle/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find all KOTs for the specified table
    const kots = await KOT.find({ tableId });

    // if (!kots || kots.length === 0) {
    //   return res.status(404).json({ message: "KOTs not found for the table" });
    // }

    // Update the settled field to true for all found KOTs
    for (const kot of kots) {
      kot.setteled = true;
      await kot.save();
    }

    res.json({ message: "KOTs settled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// router.delete('/:tableId', async (req, res) => {
//   try {
//     const { tableId } = req.params;
//     const { canceledItemNames } = req.body;
    

//     // Find the KOT for the specified table
//     const kot = await KOT.findOne({ tableId, setteled: false });

//     if (!kot) {
//       return res.status(404).json({ message: "KOT not found" });
//     }

//     // Find all KOTs related to the found KOT by orderNumber
//     const relatedKOTs = await KOT.find({ tableId: kot.tableId });
//     // console.log(relatedKOTs)
//     // Iterate over each related KOT
//     for (const kot of relatedKOTs) {
//       // Update selected KOT items by marking them as canceled
//       kot.itemsWithoutBarCategory.forEach(async (item) => {
//         if (canceledItemNames.includes(item.name)) {
//           item.isCanceled = true;

//           // Find the corresponding order and update its isCanceled field
//           const order = await Order.findOneAndUpdate(
//             { tableId: kot.tableId, "items.name": item.name, isTemporary: true },
//             { $set: { "items.$.isCanceled": true } }
//           );

//           if (!order) {
//             console.error(`Order for item ${item.name} not found`);
//           }
//         }
//       });

//       // Save the updated KOT
//       await kot.save();
//     }

//     // Send response
//     res.json({ message: "Selected KOT items and corresponding orders canceled successfully" });
//   } catch (error) {
//     console.error("Error cancelling KOT items:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });




// router.delete('/:tableId', async (req, res) => {
//   try {
//     const { tableId } = req.params;
//     const { canceledItemNames } = req.body;

//     // Find the BOT document for the specified table
//     const botOrder = await BOT.findOne({ tableId });

//     if (!botOrder) {
//       return res.status(404).json({ message: "BOT order not found" });
//     }

//     // Iterate over each item in the BOT order
//     botOrder.itemsWithBarCategory.forEach(async (item) => {
//       if (canceledItemNames.includes(item.name)) {
//         // Mark the item as canceled
//         item.isCanceled = true;
//       }
//     });

//     // Save the updated BOT document
//     await botOrder.save();

//     // Send response
//     res.json({ message: "Selected BOT items canceled successfully" });
//   } catch (error) {
//     console.error("Error canceling BOT items:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });



// router.delete('/:tableId', async (req, res) => {
//   try {
//     const { tableId } = req.params;
//     const { canceledItemNames } = req.body;

//     // Find the KOT for the specified table
//     const kot = await KOT.findOne({ tableId, setteled: false });

//     if (!kot) {
//       return res.status(404).json({ message: "KOT not found" });
//     }

//     // Find the BOT document for the specified table
//     const botOrder = await BOT.findOne({ tableId });

//     // Iterate over each related KOT
//     const relatedKOTs = await KOT.find({ tableId: kot.tableId });
//     for (const kot of relatedKOTs) {
//       // Update selected KOT items by marking them as canceled
//       kot.itemsWithoutBarCategory.forEach(async (item) => {
//         if (canceledItemNames.includes(item.name)) {
//           item.isCanceled = true;

//           // Find the corresponding order and update its isCanceled field
//           const order = await Order.findOneAndUpdate(
//             { tableId: kot.tableId, "items.name": item.name, isTemporary: true },
//             { $set: { "items.$.isCanceled": true } }
//           );

//           if (!order) {
//             console.error(`Order for item ${item.name} not found`);
//           }
//         }
//       });

//       // Save the updated KOT
//       await kot.save();
//     }

//     // If BOT order exists, update its items as well
//     if (botOrder) {
//       botOrder.itemsWithBarCategory.forEach((item) => {
//         if (canceledItemNames.includes(item.name)) {
//           item.isCanceled = true;
//         }
//       });
//       await botOrder.save();
//     }

//     // Send response
//     res.json({ message: "Selected KOT and BOT items canceled successfully" });
//   } catch (error) {
//     console.error("Error cancelling KOT and BOT items:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// cancel kot and bot
router.delete('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { canceledItemNames } = req.body;

    // Find the KOT for the specified table
    const kot = await KOT.findOne({ tableId, setteled: false });

    if (!kot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    // Find the BOT document for the specified table
    const botOrder = await BOT.findOne({ tableId });

    // Iterate over each related KOT
    const relatedKOTs = await KOT.find({ tableId: kot.tableId });
    for (const kot of relatedKOTs) {
      // Update selected KOT items by marking them as canceled
      kot.itemsWithoutBarCategory.forEach(async (item) => {
        if (canceledItemNames.includes(item.name)) {
          item.isCanceled = true;

          // Find the corresponding order and update its isCanceled field
          const order = await Order.findOneAndUpdate(
            { tableId: kot.tableId, "items.name": item.name, isTemporary: true },
            { $set: { "items.$.isCanceled": true } }
          );

          if (!order) {
            console.error(`Order for item ${item.name} not found`);
          }
        }
      });

      // Save the updated KOT
      await kot.save();
    }

    // If BOT order exists, update its items as well
    if (botOrder) {
      botOrder.itemsWithBarCategory.forEach(async (item) => {
        if (canceledItemNames.includes(item.name)) {
          item.isCanceled = true;

          // Find the corresponding order and update its isCanceled field
          const order = await Order.findOneAndUpdate(
            { tableId: botOrder.tableId, "items.name": item.name, isTemporary: true },
            { $set: { "items.$.isCanceled": true } }
          );

          if (!order) {
            console.error(`Order for item ${item.name} not found`);
          }
        }
      });
      await botOrder.save();

      // Update the isCanceled field in Orders collection for BOT items
      const orders = await Order.updateMany(
        { tableId: botOrder.tableId, "items.name": { $in: canceledItemNames } },
        { $set: { "items.$.isCanceled": true } }
      );
    }

    // Send response
    res.json({ message: "Selected KOT and BOT items canceled successfully" });
  } catch (error) {
    console.error("Error cancelling KOT and BOT items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;