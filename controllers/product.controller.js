import { Product } from '../models/product.model.js';
import {  ApiResponse, ApiError, asyncHandler } from '../utils/index.js';



// export const getAllProducts = asyncHandler(async (req, res, next) => {
//   try {
//       console.log("Attempting to fetch products from database"); // Log action
//       const products = await Product.find().lean();
//     //   console.log("Products fetched successfully", products); // Log result
      
//       if (!products.length) {
//           console.warn('No products found in the database.');
//           return next(new ApiError(404, 'No products found'));
//       }

//       res.status(200).json(new ApiResponse(200, products, 'Products retrieved successfully'));
//   } catch (error) {
//       console.error('Error while fetching products:', error); // Log error details
//       return next(new ApiError(500, `An error occurred while retrieving products. ${error.message}`));
//   }
// });

export const getProductById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to fetch product with ID: ${id}`);

    const product = await Product.findById(id).lean(); // Use Mongoose's findById to fetch by _id

    if (!product) {
      console.warn(`No product found with ID: ${id}`);
      return next(new ApiError(404, 'Product not found'));
    }

    res.status(200).json(new ApiResponse(200, product, 'Product retrieved successfully by ID'));
  } catch (error) {
    console.error(`Error fetching product by ID: ${error.message}`);
    return next(new ApiError(500, `An error occurred while retrieving the product. ${error.message}`));
  }
});

export const getAllProducts = asyncHandler(async (req, res, next) => {
  try {
    console.log("Attempting to fetch products with limited fields from database");

    // Use projection to select only specific fields
    const products = await Product.find({}, {
      slug: 1,                   // Include `slug`
      category: 1,               // Include `category`
      colour: 1,                 // Include `colour`
      description: 1,            // Include `description`
      name: 1,                   // Include `name`
      subCategory: 1,            // Include `subCategory`
      type: 1,                   // Include `type`
      boardSpecifications: 1,    // Include `boardSpecifications`
      "images.boardImage": 1     // Include only `boardImage` from `images`
    }).lean();

    if (!products.length) {
      console.warn('No products found in the database.');
      return next(new ApiError(404, 'No products found'));
    }

    res.status(200).json(new ApiResponse(200, products, 'Products retrieved successfully with limited fields'));
  } catch (error) {
    console.error('Error while fetching products with limited fields:', error); 
    return next(new ApiError(500, `An error occurred while retrieving products. ${error.message}`));
  }
});


