// routes/kot.js

const express = require('express');
const router = express.Router();
const BOT = require('../models/BOT');
const Order = require('../models/Order');


router.post('/botOrder/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { itemsWithBarCategory = [], waiterName, } = req.body;

    const modifiedItems = itemsWithBarCategory.map(item => ({
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


    const newBOT = new BOT({
      tableId,
      itemsWithBarCategory: modifiedItems,
      waiterName,
      createdAt: previousDate,
      BOTDate: previousDate
    });

    const savedBOT = await newBOT.save();

    res.json(savedBOT);
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
    const result = await BOT.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentDateString), // Start of the current date
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // End of the current date
          }


        }
      },
      {
        $unwind: '$itemsWithBarCategory'
      },
      {
        $group: {
          _id: '$itemsWithBarCategory.name',
          totalQuantity: { $sum: '$itemsWithBarCategory.quantity' }
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
    const result = await BOT.aggregate([
      {
        $unwind: '$itemsWithBarCategory'
      },
      {
        $match: { 'itemsWithBarCategory.isCanceled': false } // Filter out only items where isCanceled is false
      },
      {
        $group: {
          _id: {
            name: '$itemsWithBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithBarCategory.quantity' }
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
    const result = await BOT.aggregate([
      {
        $unwind: '$itemsWithBarCategory'
      },
      {
        $match: { 'itemsWithBarCategory.isCanceled': true } // Filter out only canceled items
      },
      {
        $group: {
          _id: {
            name: '$itemsWithBarCategory.name',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalQuantity: { $sum: '$itemsWithBarCategory.quantity' }
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


router.get('/bot/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find the latest KOT for the specified table
    const bot = await BOT.findOne({ tableId }).sort({ createdAt: -1 });

    if (!bot) {
      return res.status(404).json({ message: "BOT not found" });
    }

    // Filter out canceled items
    const itemsNotCanceled = bot.itemsWithBarCategory.filter(item => !item.isCanceled);

    // Construct a new KOT object with only non-canceled items
    const botFiltered = {
      ...bot.toObject(),
      itemsWithBarCategory: itemsNotCanceled
    };

    res.status(200).json(botFiltered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.patch('/bot/settle/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find all KOTs for the specified table
    const bots = await BOT.find({ tableId });

    // if (!kots || kots.length === 0) {
    //   return res.status(404).json({ message: "KOTs not found for the table" });
    // }

    // Update the settled field to true for all found KOTs
    for (const bot of bots) {
      bot.setteled = true;
      await bot.save();
    }

    res.json({ message: "BOTs settled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.delete('/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { canceledItemNames } = req.body;
    

    // Find the KOT for the specified table
    const bot = await BOT.findOne({ tableId, setteled: false });

    if (!bot) {
      return res.status(404).json({ message: "KOT not found" });
    }

    // Find all KOTs related to the found KOT by orderNumber
    const relatedBOTs = await BOT.find({ tableId: bot.tableId });
    // console.log(relatedKOTs)
    // Iterate over each related KOT
    for (const bot of relatedBOTs) {
      // Update selected KOT items by marking them as canceled
      bot.itemsWithBarCategory.forEach(async (item) => {
        if (canceledItemNames.includes(item.name)) {
          item.isCanceled = true;

          // Find the corresponding order and update its isCanceled field
          const order = await Order.findOneAndUpdate(
            { tableId: bot.tableId, "items.name": item.name, isTemporary: true },
            { $set: { "items.$.isCanceled": true } }
          );

          if (!order) {
            console.error(`Order for item ${item.name} not found`);
          }
        }
      });

      // Save the updated KOT
      await bot.save();
    }

    // Send response
    res.json({ message: "Selected BOT items and corresponding orders canceled successfully" });
  } catch (error) {
    console.error("Error cancelling BOT items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;