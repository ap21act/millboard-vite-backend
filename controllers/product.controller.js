import { Product } from '../models/product.model.js';
import {  ApiResponse, ApiError, asyncHandler } from '../utils/index.js';



export const getAllProducts = asyncHandler(async (req, res, next) => {
    try {
      // Fetch all products from the database
      const products = await Product.find().limit(50).lean();
  
      if (!products.length) {
        console.warn('No products found in the database.');
        return next(new ApiError(404, 'No products found'));
      }
  
      
      res.status(200).json(new ApiResponse(200, products, 'Products retrieved successfully'));
    } catch (error) {
      console.error('Error while fetching products:', error);
      return next(new ApiError(500, 'An error occurred while retrieving products. Please try again later.'));
    }
  });