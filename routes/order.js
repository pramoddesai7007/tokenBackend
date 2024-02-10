const express = require('express');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Section = require('../models/Section');
const router = express.Router();
const moment = require('moment');
const mongoose = require('mongoose')
const Menu = require('../models/Menu');


router.post('/order/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { items = [], subtotal, CGST, SGST, total, isTemporary, acPercentageAmount, isPrint } = req.body;

    const modifiedItems = items.map(item => ({
      ...item,
      taste: item.taste || '', // Set the taste information, or default to an empty string
    }));

    const newOrder = new Order({
      tableId,
      items: modifiedItems,
      subtotal,
      CGST,
      SGST,
      acPercentageAmount,
      total,
      isTemporary: isTemporary !== undefined ? isTemporary : true,
      isPrint
    });

    const savedOrder = await newOrder.save();

    res.json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.patch('/order/:tableId', async (req, res) => {
router.patch('/order/update-order-by-table/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { items = [], subtotal, CGST, SGST, total, isTemporary, isPrint } = req.body;

    const modifiedItems = items.map(item => ({
      ...item,
      taste: item.taste || '', // Set the taste information, or default to an empty string
    }))

    const updatedOrder = await Order.findOneAndUpdate(
      { tableId: tableId }, // Use the correct field name from your schema
      {
        items: modifiedItems,
        subtotal,
        CGST,
        SGST,
        total,
        isTemporary,
        isPrint
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// updated api
router.patch('/update-order-by-id/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items = [], subtotal, CGST, SGST, total, isTemporary, acPercentageAmount, isPrint, cashAmount, onlinePaymentAmount, dueAmount, complimentaryAmount, discount } = req.body;

    // Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid Order ID' });
    }

    const modifiedItems = items.map(item => ({
      ...item,
      taste: '', // Set the taste information based on your requirements
    }));

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        items: modifiedItems,
        subtotal,
        CGST,
        SGST,
        total,
        isTemporary,
        isPrint,
        acPercentageAmount,
        cashAmount,
        onlinePaymentAmount,
        dueAmount,
        complimentaryAmount,
        discount,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// edit api
router.patch('/update-order-by-number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const updatedOrderData = req.body; // Assuming the updated data is sent in the request body

    // Find the order based on the order number
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the order with the new data
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber },
      { $set: updatedOrderData },
      { new: true } // Return the modified document
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findByIdAndRemove(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders) {
      return res.status(404).json({ error: 'Orders not found' });
    }

    const ordersWithTableNames = await Promise.all(
      orders.map(async (order) => {
        const table = await Table.findById(order.tableId);
        return {
          ...order.toObject(),
          tableName: table ? table.tableName : 'Unknown Table',
        };
      })
    );

    res.json(ordersWithTableNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// routes/order.js
router.get('/order/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    // Filter bills with isTemporary: true
    const temporaryBills = await Order.find({ tableId, isTemporary: true }).sort({ createdAt: -1 });

    res.json(temporaryBills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders/date', async (req, res) => {
  try {
    // Default to the current date
    let startDate = moment().startOf('day');
    let endDate = moment().endOf('day');

    // If start and end dates are provided in the query parameters, use them
    if (req.query.startDate && req.query.endDate) {
      startDate = moment(req.query.startDate).startOf('day');
      endDate = moment(req.query.endDate).endOf('day');
    }

    // Find orders within the date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update the /menu-statistics endpoint in your Express router
router.get('/menu-statistics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Create a filter based on the date range
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.orderDate = {
        $gte: new Date(startDate),
        $lt: new Date(endDate + 'T23:59:59.999Z'),
      };
    } else if (startDate) {
      dateFilter.orderDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.orderDate = { $lt: new Date(endDate + 'T23:59:59.999Z') };
    }

    // Find orders based on the date filter
    const allOrders = await Order.find(dateFilter);

    // Fetch menu prices
    const menuPrices = await Menu.find({}, { name: 1, price: 1 });

    // Create a map of menu prices for efficient lookup
    const menuPricesMap = menuPrices.reduce((acc, menu) => {
      acc[menu.name] = menu.price;
      return acc;
    }, {});

    // Calculate menu statistics with orderDate
    const menuStatistics = {};
    allOrders.forEach((order) => {
      order.items.forEach((item) => {
        const { name, quantity } = item;

        // Fetch the price from the menuPricesMap
        const price = menuPricesMap[name] || 0;

        // Update menu statistics
        if (!menuStatistics[name]) {
          menuStatistics[name] = {
            count: 1,
            totalQuantity: quantity,
            totalPrice: price * quantity,
            price, // Include the 'price' field
          };
        } else {
          menuStatistics[name].count += 1;
          menuStatistics[name].totalQuantity += quantity;
          menuStatistics[name].totalPrice += price * quantity;
        }
      });
    });

    res.json({ menuStatistics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/get/order/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Check if the orderNumber is provided
    if (!orderNumber) {
      return res.status(400).json({ error: 'Invalid Order Number' });
    }

    // Find the order based on the orderNumber
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to fetch the order based on the table ID
router.get('/orders/:tableId', async (req, res) => {
  try {
    const tableId = req.params.tableId;

    // Assuming the order is uniquely identified by the table ID
    const order = await Order.findOne({ tableId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this route at the end of your existing code
router.get('/latest-orders', async (req, res) => {
  try {
    // Fetch the latest 10 orders based on the _id field in descending order
    const isPrintValues = [0, 1]; // Possible values for isPrint

    const latestOrders = await Order.find({ isPrint: { $in: isPrintValues } })
      .sort({ _id: -1 }) // Sort by _id instead of createdAt
      .limit();

    if (!latestOrders || latestOrders.length === 0) {
      return res.status(404).json({ error: 'No orders found' });
    }

    res.json(latestOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/orders/list/menuwise', async (req, res) => {
  try {
    const { date, menuName } = req.query;

    // Convert the date string to a Date object
    const selectedDate = new Date(date);

    // Find orders for the given date and menu name
    const orders = await Order.find({
      'orderDate': { $gte: selectedDate, $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) }, // Considering orders within the same day
      'items.name': menuName
    });

    // Calculate menu counts and quantities
    let menuCounts = 0;
    let totalQuantity = 0;
    let totalPrice = 0;


    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.name === menuName) {
          menuCounts++;
          totalQuantity += item.quantity;
          totalPrice += item.price * item.quantity;

        }
      });
    });

    res.json({ menuCounts, totalQuantity, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get-next-order-number', async (req, res) => {
  try {
    // Get the total count of documents in the collection
    const totalCount = await Order.countDocuments();

    // Generate the next order number based on the total count
    const nextOrderNumber = `${totalCount + 1}`;

    res.json({ nextOrderNumber });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//Active Tables
router.get('/temporary-orders-count', async (req, res) => {
  try {
    const temporaryOrdersCount = await Order.countDocuments({ isTemporary: true });

    res.json({ temporaryOrdersCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Today's Sales
router.get('/total-amount-for-current-date', async (req, res) => {
  try {
    const currentDate = moment().startOf('day'); // Get the start of the current date
    const nextDate = moment(currentDate).add(1, 'days'); // Get the start of the next date

    const totalForCurrentDate = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: currentDate.toDate(),
            $lt: nextDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }, // Replace 'totalAmount' with the actual field you want to sum
        },
      },
    ]);

    // If there are no orders for the current date, set totalAmount to 0
    const result = totalForCurrentDate.length > 0 ? totalForCurrentDate[0].total : 0;

    res.json({ totalForCurrentDate: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Previous month Sales
router.get('/total-amount-for-previous-month', async (req, res) => {
  try {
    const startDate = moment().subtract(1, 'months').startOf('month'); // Get the start of the previous month
    const endDate = moment().startOf('month'); // Get the start of the current month

    const totalForPreviousMonth = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }, // Replace 'total' with the actual field you want to sum
        },
      },
    ]);

    // If there are no orders for the previous month, set total to 0
    const result = totalForPreviousMonth.length > 0 ? totalForPreviousMonth[0].total : 0;

    res.json({ totalForPreviousMonth: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router



// router.get('/get/order/:orderId', async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     // Check if the orderId is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return res.status(400).json({ error: 'Invalid Order ID' });
//     }

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.json(order);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// router.get('/get-next-order-number', async (req, res) => {
//   try {
//     const highestOrder = await Order.findOne({}, { orderNumber: 1 })
//       .sort({ orderNumber: -1 })
//       .limit(1);

//     let nextOrderNumber;
//     if (highestOrder) {
//       const lastOrderNumber = highestOrder.orderNumber;
//       const orderNumberSuffix = parseInt(lastOrderNumber.replace('BILL-', ''), 10);
//       nextOrderNumber = `BILL-${orderNumberSuffix + 1}`;
//     } else {
//       nextOrderNumber = 'BILL-1000';
//     }

//     res.json({ nextOrderNumber });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });