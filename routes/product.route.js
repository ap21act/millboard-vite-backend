import { Router } from 'express';
import {  getAllProducts,getProductById } from '../controllers/product.controller.js';


const router = Router();




router.get('/', (req, res) => {
  
  console.log('This is Product Route');
  res.send('This is Product Route Response');
});

router.get('/getAllProducts', getAllProducts);

// Route to fetch a single product by slug
router.get('/getProductById/:id', getProductById);




export default router;