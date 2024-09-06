const express = require('express');
const router = express.Router();
const CounterCategory = require('../models/Counter');
const Coupon = require('../models/Coupon');
const MainCategory = require('../models/MainCategory');
const Menu = require('../models/Menu');
const mongoose = require('mongoose')
const moment = require('moment');


router.post('/billCouponOrder', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items = [], subtotal, CGST, SGST, total, acPercentageAmount } = req.body;

    // Create a new order
    const newCoupon = new Coupon({
      orderId,
      items,
      subtotal,
      CGST,
      SGST,
      acPercentageAmount,
      total,
    });

    // Save the order
    const savedOrder = await newCoupon.save();

    res.json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/couponOrder', async (req, res) => {
  try {
    const { items = [], subtotal, CGST, SGST, total, counterName } = req.body;


    // Creating a new coupon with generated coupon number and counterName
    const coupon = new Coupon({
      counterName: counterName, // Include the counterName
      items,
      subtotal,
      CGST,
      SGST,
      total,
    });

    // Saving the coupon
    const savedCoupon = await coupon.save();

    // Sending the response
    res.status(201).json(savedCoupon);
  } catch (error) {
    // Handling errors
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// router.post('/billCouponOrder', async (req, res) => {
//   try {
//     const { mainCategoryId, menus, counterName, subtotal, CGST, SGST, total, cashAmount, onlinePaymentAmount, complimentaryAmount, dueAmount, discount } = req.body;


//     // Increment the coupon number by 1
//     const updatedCouponNumber = await Coupon.findOneAndUpdate({}, { $inc: { couponNumber: 1 } }, { new: true, upsert: true, sort: { couponNumber: -1 } });

//     // Get the updated coupon number
//     const couponNumber = updatedCouponNumber.couponNumber;

//     // Creating a new coupon with generated coupon number and counterName
//     const coupon = new Coupon({
//       mainCategory: { mainCategory: mainCategoryId, menus: menus },
//       counterName: counterName,
//       couponNumber: couponNumber,
//       subtotal: subtotal,
//       CGST: CGST,
//       SGST: SGST,
//       total: total,
//       cashAmount: cashAmount,
//       onlinePaymentAmount: onlinePaymentAmount,
//       complimentaryAmount: complimentaryAmount,
//       dueAmount: dueAmount,
//       discount: discount,
//       menus: menus
//     });

//     // Saving the coupon
//     const savedCoupon = await coupon.save();

//     // Sending the response
//     res.status(201).json(savedCoupon);
//   } catch (error) {
//     // Handling errors
//     console.error('Error creating coupon:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


router.patch('/bill/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;
    const { subtotal, CGST, SGST, total, cashAmount, onlinePaymentAmount, complimentaryAmount, dueAmount, discount } = req.body;

    // Find the coupon by ID and update its fields
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
      subtotal: subtotal,
      CGST: CGST,
      SGST: SGST,
      total: total,
      cashAmount: cashAmount,
      onlinePaymentAmount: onlinePaymentAmount,
      complimentaryAmount: complimentaryAmount,
      dueAmount: dueAmount,
      discount: discount,
    }, { new: true });

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Send the updated coupon in the response
    res.status(200).json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('counter/:counterName', async (req, res) => {
  try {
    const { counterName } = req.params;

    const counter = await CounterCategory.findOne({ counterName }).populate('mainCategory');

    if (!counter) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.status(200).json(counter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/coupon/:mainCategory/:couponName', async (req, res) => {
  try {
    const { mainCategory, couponName } = req.params;

    const coupon = await Coupon.findOne({ mainCategory, name: couponName }).populate('mainCategory').sort({ createdAt: -1 });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const itemsNotCanceled = coupon.menus.filter(item => !item.isCanceled);

    // Fetch additional data from the counter and include it in the response
    const counter = await CounterCategory.findById(mainCategory); // Assuming mainCategory is the Counter ID
    if (!counter) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    // Include quantity for each menu item
    const couponWithQuantity = {
      ...coupon.toObject(),
      menus: itemsNotCanceled.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity, // Include quantity
        isCanceled: item.isCanceled
      }))
    };

    couponWithQuantity.counterName = counter.counterName;
    couponWithQuantity.mainCategoryName = counter.mainCategoryName;

    res.status(200).json(couponWithQuantity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/coupon/latest', async (req, res) => {
  try {
    // Query the database for the latest coupon record based on createdAt
    const latestCoupon = await Coupon.findOne().sort({ createdAt: -1 });

    if (!latestCoupon) {
      return res.status(404).json({ message: "No coupons found" });
    }

    // Extract CGST and SGST values
    // const { CGST, SGST } = latestCoupon;

    // Send the CGST and SGST values in the response
    res.status(200).json({ latestCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/orderNumber/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Find the coupon by order number
    const coupon = await Coupon.findOne({ orderNumber });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId).populate('mainCategory.mainCategory');

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/', async (req, res) => {
  try {
    const counterCategories = await CounterCategory.find().populate('mainCategory');

    // Extracting mainCategory data for each counter category
    const counterCategoriesWithMainCategory = counterCategories.map(category => {
      const mainCategoryData = category.mainCategory ? category.mainCategory.toObject() : null;
      return { ...category.toObject(), mainCategory: mainCategoryData };
    });

    res.json(counterCategoriesWithMainCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/coupon/settle/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.settled = true;

    await coupon.save();

    res.json({ message: "Coupon settled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/coupon/:couponId', async (req, res) => {
  try {
    const { couponId } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





router.patch('/update/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { cashAmount, onlinePaymentAmount, dueAmount, complimentaryAmount, discount } = req.body;


    // Update the order with the new data
    const updatedOrder = await Coupon.findOneAndUpdate(
      { orderNumber: orderNumber },
      {
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


router.put('/orders/flag', async (req, res) => {
  try {
    // Retrieve the Cake category from the database
    const cakeCategory = await MainCategory.findOne({ name: 'Settle' });

    // Check if cake category is found
    if (!cakeCategory) {
      return res.status(404).json({ message: 'Cake category not found' });
    }

    // Retrieve menus from the Cake category
    const cakeMenus = cakeCategory.menus;

    // Find orders with flag 1
    const orders = await Coupon.find({ flag: 1 });

    // Check if any orders are found
    if (orders.length === 0) {
      console.log("No order found")
      return res.status(404).json({ message: 'No orders with flag equal to 1 found' });
    }

    // Iterate through each order and update
    const updatedOrders = await Promise.all(orders.map(async (order) => {
      // Clear items array and add all menus from the Cake category
      order.items = cakeMenus.map(menu => ({
        name: menu.name,
        price: menu.price,
        quantity: 1,
        isCanceled: false,
      }));

      // Update cashAmount
      order.cashAmount = "100.00";

      // Remove existing payment
      order.onlinePaymentAmount = "0.00";
      order.discount = "0.00";
      order.complimentaryAmount = "0.00";
      order.dueAmount = "0.00";

      // Recalculate subtotal and total
      order.subtotal = order.items.reduce((total, item) => total + item.price * item.quantity, 0);
      order.total = order.subtotal;

      // Update flag property
      order.flag = 2;

      // Save the updated order
      await order.save();

      return order;
    }));

    return res.json(updatedOrders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/order/update-flag/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;

  try {
    // Find the order with the given order number
    const order = await Coupon.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the flag property to true
    order.flag = 1;

    // Save the updated order
    await order.save();

    // Return success response
    return res.json({ message: 'Flag updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get('/coupon/date', async (req, res) => {
  try {
    // Default to the current date
    let startDate = moment().startOf('day');
    let endDate = moment().endOf('day');

    // If start and end dates are provided in the query parameters, use them
    if (req.query.startDate && req.query.endDate) {
      startDate = moment(req.query.startDate).startOf('day');
      endDate = moment(req.query.endDate).endOf('day');
    }

    // Find orders within the date range based on orderDate field
    const orders = await Coupon.find({
  
      orderDate: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






router.get('/coupons/date', async (req, res) => {
  try {
    // Extract start date and end date from query parameters
    const { startDate, endDate } = req.query;

    // Ensure both start date and end date are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both start date and end date are required' });
    }

    // Parse start date and end date
    const startDateObj = moment(startDate).startOf('day');
    const endDateObj = moment(endDate).endOf('day');

    // Find coupons within the date range based on orderDate field
    const coupons = await Coupon.find({
      orderDate: { $gte: startDateObj.toDate(), $lte: endDateObj.toDate() }
    });

    // Extract required information from coupons
    const items = coupons.flatMap(coupon => {
      return coupon.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router