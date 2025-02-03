const { Product } = require('../models'); // 引入 Sequelize Product 模型

class ProductController {

    /**
     * 通过 ID 查询单个产品
     * 公开接口，无需管理员权限
     */
    static async getProductById(req, res) {
        try {
            const { id } = req.params; // 从 URL 参数中获取产品 ID

            // 查找对应的产品
            const product = await Product.findByPk(id);

            // 如果未找到产品，返回 404 状态码
            if (!product) {
                return res.status(404).json({ message: '未找到指定的产品！' });
            }

            // 返回产品数据
            res.status(200).json(product);
        } catch (error) {
            console.error('Get Product By ID Error:', error);
            res.status(500).json({ message: '无法加载产品信息！' });
        }
    }


    /**
     * 分页获取产品，每页显示 100 个
     * 公开接口，无需管理员权限
     */
    static async getPaginatedProducts(req, res) {
        try {
            // 从查询参数中获取页码参数，默认为第 1 页
            const page = parseInt(req.query.page) || 1;

            // 每页显示 100 个
            const limit = 20;
            const offset = (page - 1) * limit;

            // 获取分页产品列表
            const products = await Product.findAndCountAll({
                limit,         // 每页限制的数量
                offset,        // 跳过的数量
                order: [['id', 'ASC']], // 可根据需求指定排序规则
            });

            // 响应数据，包括分页信息
            res.status(200).json({
                totalItems: products.count,        // 总产品数量
                totalPages: Math.ceil(products.count / limit), // 总页数
                currentPage: page,                // 当前页码
                products: products.rows,          // 当前页的产品数据
            });
        } catch (error) {
            console.error('Get Paginated Products Error:', error);
            res.status(500).json({ message: 'Impossible de charger la liste des produits！' });
        }
    }


    /**
     * 获取所有产品
     * 公开接口，无需管理员权限
     */
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.status(200).json(products);
        } catch (error) {
            console.error('Get All Products Error:', error);
            res.status(500).json({ message: 'Impossible de charger la liste des produits！' });
        }
    }

    /**
     * 创建新产品
     * 仅管理员可操作
     */
    static async createProduct(req, res) {
        try {
            const newProduct = await Product.create(req.body); // req.body 应包含产品信息
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Create Product Error:', error);
            res.status(400).json({ message: 'Impossible de créer le produit, veuillez vérifier vos informations de saisie！' });
        }
    }

    /**
     * 更新产品
     * 仅管理员可操作
     */
    static async updateProduct(req, res) {
        try {
            const { id } = req.params; // 从 URL 参数获取产品 ID
            const updates = req.body; // 获取更新数据

            const product = await Product.findByPk(id); // 查找对应产品
            if (!product) {
                return res.status(404).json({ message: 'Le produit spécifié n\'a pas été trouvé！' });
            }

            const updatedProduct = await product.update(updates); // 更新产品字段
            res.status(200).json(updatedProduct);
        } catch (error) {
            console.error('Update Product Error:', error);
            res.status(400).json({ message: 'Impossible de mettre à jour les informations sur le produit！' });
        }
    }

    /**
     * 删除产品
     * 仅管理员可操作
     */
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id); // 查找要删除的产品
            if (!product) {
                return res.status(404).json({ message: 'Le produit spécifié n\'a pas été trouvé！' });
            }

            await product.destroy(); // 删除产品
            res.status(200).json({ message: 'Produit supprimé avec succès！' });
        } catch (error) {
            console.error('Delete Product Error:', error);
            res.status(500).json({ message: 'Impossible de supprimer le produit！' });
        }
    }
}

module.exports = ProductController;