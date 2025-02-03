const express = require('express');
const router = express.Router();

// 引入 Product 路由
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const internalproducts = require('./internalProductRoutes');

// 添加路由前缀 /api/products
router.use('/products', productRoutes);
router.use('/user', userRoutes);
router.use('/internal-products', internalproducts);

module.exports = router;