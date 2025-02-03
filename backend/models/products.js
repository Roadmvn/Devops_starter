'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.InternalProduct, {
                foreignKey: 'productId',
                as: 'InternalProduct',
            });
        }
    }

    Product.init(
        {
            code: {
                type: DataTypes.STRING,
                unique: true, // 确保唯一
                allowNull: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Unknown',
            },
            brand: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Unknown',
            },
            categories: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: 'Unknown',
            },
            labels: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'None',
            },
            quantity: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            image_url: {
                type: DataTypes.TEXT,
                allowNull: true, // 可以为空
            },
            image_nutrition_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            energy_kcal: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            fat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            saturated_fat: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            sugars: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            salt: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            proteins: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Product', // 模型名称

            // 默认 Scope（可以根据需求定制输出）
            defaultScope: {
                attributes: { exclude: [] }, // 默认不排除任何字段
            },

            // 自定义 Scope
            scopes: {
                minimal: {
                    attributes: ['code', 'name', 'brand'], // 例如只返回基础信息
                },
            },
        }
    );

    return Product;
};