import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth, isSellerOrAdmin } from '../utils.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const productRouter = express.Router();

productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const name = req.query.name || '';
    const category = req.query.category || '';

    const seller = req.query.seller || '';
    const order = req.query.order || '';
    const min =
      req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
    const max =
      req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
    const rating =
      req.query.rating && Number(req.query.rating) !== 0
        ? Number(req.query.rating)
        : 0;

    const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};

    const sellerFilter = seller ? { seller } : {};
    const categoryFilter = category ? { category } : {};

    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
    const ratingFilter = rating ? { rating: { $gte: rating } } : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : { _id: -1 };

    const products = await Product.find({ 
      ...sellerFilter,  
      ...nameFilter,  
      ...categoryFilter,
      ...priceFilter, 
      ...ratingFilter,
    })
    .populate('seller', 'seller.name seller.logo')
    .sort(sortOrder);

    res.send(products); // This will return the products with the images array
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get(
  '/seed',
  expressAsyncHandler(async (req, res) => {
    try {
      // Remove existing data to prevent duplication
      await Product.deleteMany({});
      
      // Insert new products with multiple images
      const seller = await User.findOne({ isSeller: true });
      if (seller) {
        const products = data.products.map((product) => ({
          ...product,
          seller: seller._id,
        }));
        const createdProducts = await Product.insertMany(products);
        res.send({ createdProducts });
      } else {
        res
          .status(500)
          .send({ message: 'No seller found. first run /api/users/seed' });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }  
  })
);

productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate the product ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id).populate(
      'seller',
      'seller.name seller.logo seller.rating seller.numReviews'
    );
    if (product) {
      res.send(product); // returns product with multiple images
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: 'sample name ' + Date.now(),
      seller:req.user._id,
      images: ['/images/sample1.jpg', '/images/sample2.jpg'], // Example array of images
      price: 0,
      category: 'sample category',
      brand: 'sample brand',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'sample description',
    });
    const createdProduct = await product.save();
    res.send({ message: 'Product Created', product: createdProduct });
  })
);

// Update product
productRouter.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.images = req.body.images; // Update images array
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      res.send({ message: 'Product Updated', product: updatedProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).send({ message: 'Product Not Found' });
      }

      const deleteProduct = await Product.findByIdAndDelete(req.params.id);

      // Send success response
      res.send({ message: 'Product Deleted', product: deleteProduct });

    } catch (error) {
      console.error('Error deleting product:', error); // Log the error for debugging
      res.status(500).send({ message: 'Server Error', error: error.message });
    }
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product Not Found' });
    }

    // Check if the user has purchased and received the product
    const orders = await Order.find({
      user: req.user._id, // Find orders by the current user
      'orderItems.product': productId, // Check if the product is in the order items
      isDelivered: true, // Ensure the product has been delivered
    });

    if (!orders.length) {
      return res.status(400).send({
        message: 'You can only review a product you have purchased and received',
      });
    }

    // Check if the user has already submitted a review for this product
    if (product.reviews.find((x) => x.name === req.user.name)) {
      return res
        .status(400)
        .send({ message: 'You already submitted a review' });
    }

    // Add the new review
    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;

    // Save the updated product
    const updatedProduct = await product.save();
    res.status(201).send({
      message: 'Review Created',
      review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
    });
  })
);

export default productRouter;