const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeatured);
router.get('/wishlist', productController.getWishlistProducts); // GET /wishlist?ids=...
router.get('/:id', productController.getProductById);

module.exports = router;
