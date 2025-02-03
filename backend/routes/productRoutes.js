const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// 中间件
const authMiddleware = require('../middleware/authMiddleware'); // 验证用户是否登录
const isAdmin = require('../middleware/isAdmin');   // 验证用户是否为管理员

// 新增分页获取产品的路由
router.get('/products',authMiddleware, isAdmin, ProductController.getPaginatedProducts);
router.get('/product/:id',authMiddleware, isAdmin, ProductController.getProductById);

// 仅管理员操作
router.post('/', authMiddleware, isAdmin, ProductController.createProduct);
router.put('/:id', authMiddleware, isAdmin, ProductController.updateProduct);
router.delete('/:id', authMiddleware, isAdmin, ProductController.deleteProduct);

module.exports = router;