import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAdmin, isAuth, isSellerOrAdmin } from '../utils.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

import mongoose from 'mongoose';
const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};

  const orders = await Order.find({ ...sellerFilter })
  .populate('user', 'name') // Populates the user's name
  .populate({
    path: 'orderItems.product', // Populate each product in the orderItems array
    select: 'name seller', // Select the product's name and seller
    populate: {
      path: 'seller', // Populate the seller field in the product
      select: 'seller.name', // Select the `name` field within the `seller` object in the User schema
    },
  }).sort({ isDelivered: -1, isPaid: -1, createdAt: -1 });
    
    res.send(orders);
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);


orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'orderItems.product', // Populate each product in the orderItems array
        select: 'name seller', // Select the product's name and seller
        populate: {
          path: 'seller', // Populate the seller field in the product
          select: 'seller.name', // Select the `name` field within the `seller` object in the User schema
        },
      }).sort({ isDelivered: -1, isPaid: -1, createdAt: -1 });

    res.send(orders);
  })
);


orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
      res.status(400).send({ message: 'Cart is empty' });
    } else {
      const order = new Order({
        seller: req.body.orderItems[0].seller,
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
      });
      const createdOrder = await order.save();
      res
        .status(201)
        .send({ message: 'New Order Created', order: createdOrder });
    }
  })
);


orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: 'Invalid Order ID' });
      }
      try{
      const order = await Order.findById(id);
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (err) {
      res.status(500).send({ message: 'Error fetching order' });
    }
    })
  );
  
  orderRouter.put(
    '/:id/pay',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        };
        const updatedOrder = await order.save();
        res.send({ message: 'Order Paid', order: updatedOrder });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );

  orderRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        const deleteOrder = await Order.findByIdAndDelete(req.params.id);
        res.send({ message: 'Order Deleted', order: deleteOrder });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );
  
  
  orderRouter.put(
    '/:id/deliver',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id).populate('orderItems.product');
      
      if (!order) {
        return res.status(404).send({ message: 'Order Not Found' });
      }
  
      // Update order delivery status
      order.isDelivered = true;
      order.deliveredAt = Date.now();
  
      let stockUpdates = []; // Array to store stock change messages
  
      // Reduce stock for each ordered item
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          let previousStock = product.countInStock;
          
          if (item.qty >= product.countInStock) {
            product.countInStock = 0; // If ordered quantity is greater than or equal to stock, set stock to 0
          } else {
            product.countInStock -= item.qty; // Otherwise, reduce stock normally
          }
          
          await product.save();
  
          // Store the stock update message
          stockUpdates.push(
            `${product.name}: Stock reduced from ${previousStock} to ${product.countInStock}`
          );
        }
      }
  
      const updatedOrder = await order.save();
      res.send({ 
        message: 'Order Delivered', 
        order: updatedOrder,
        stockUpdates 
      });
    })
  );

export default orderRouter;