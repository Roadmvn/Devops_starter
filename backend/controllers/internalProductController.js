const { InternalProduct, Product } = require('../models');

// 创建内部产品
exports.createInternalProduct = async (req, res) => {
    try {
        const { productId, price, quantity } = req.body;

        // 检查产品是否存在
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Produit non trouvé." });
        }

        // 创建新内部产品
        const internalProduct = await InternalProduct.create({
            sellerId: req.user.id,
            productId,
            price,
            quantity,
        });

        res.status(201).json({
            message: "Produit interne crée avec succès.",
            internalProduct,
        });
    } catch (error) {
        console.error('Erreur lors de la création du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 获取当前 seller 的内部产品列表
exports.getInternalProducts = async (req, res) => {
    try {
        const internalProducts = await InternalProduct.findAll({
            where: { sellerId: req.user.id },
            include: [{ model: Product, as: 'product' }],
        });

        res.status(200).json({
            message: "Liste des produits internes récupérée avec succès.",
            internalProducts,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits internes:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 更新内部产品
exports.updateInternalProduct = async (req, res) => {
    try {
        const { id } = req.params; // 内部产品 ID
        const { price, quantity } = req.body;

        const internalProduct = await InternalProduct.findOne({
            where: { id, sellerId: req.user.id },
        });

        if (!internalProduct) {
            return res.status(404).json({ message: "Produit interne non trouvé ou non autorisé." });
        }

        // 更新价格和数量
        internalProduct.price = price || internalProduct.price;
        internalProduct.quantity = quantity || internalProduct.quantity;
        await internalProduct.save();

        res.status(200).json({
            message: "Produit interne mis à jour avec succès.",
            internalProduct,
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// 删除内部产品
exports.deleteInternalProduct = async (req, res) => {
    try {
        const { id } = req.params; // 内部产品 ID

        const internalProduct = await InternalProduct.findOne({
            where: { id, sellerId: req.user.id },
        });

        if (!internalProduct) {
            return res.status(404).json({ message: "Produit interne non trouvé ou non autorisé." });
        }

        await internalProduct.destroy();

        res.status(200).json({ message: "Produit interne supprimé avec succès." });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit interne:', error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};