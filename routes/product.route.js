import { Router } from 'express';
import {  getAllProducts } from '../controllers/product.controller.js';


const router = Router();




router.get('/', (req, res) => {
  
  console.log('This is Product Route');
  res.send('This is Product Route Response');
});

router.get('/getAllProducts', getAllProducts);




export default router;