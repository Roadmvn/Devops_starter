const axios = require("axios");
const mysql = require("mysql2/promise"); // 启用 Promise 接口

const pool = mysql.createPool({
    host: "89.156.15.147",
    user: "root",
    password: "Jiojio000608.",
    database: "trinity",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// 延迟避免请求过于频繁
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 最大重试次数
const MAX_RETRY_COUNT = 5;

// 请求 OpenFoodFacts API 并保存到数据库
const fetchAndInsertProducts = async (page = 1, retryCount = 0) => {
    try {
        console.log(`Fetching page ${page}...`);

        // 请求数据
        const { data } = await axios.get(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=&page_size=100&page=${page}&json=true`,
            {
                headers: {
                    "User-Agent": "OpenFoodPilotApp/1.0 (https://yourwebsite.com)",
                },
            }
        );

        // 产品数组
        const products = data.products;

        // 没有更多产品
        if (!products || products.length === 0) {
            console.log("No more products to fetch.");
            return;
        }

        // 遍历所有产品并插入数据库
        for (const product of products) {
            const code = product.code || null;
            const name = product.product_name || "Unknown";
            const brand = product.brands || "Unknown";
            const categories = product.categories || "Unknown";
            const labels = product.labels || "None";
            const quantity = product.quantity || "Unknown";
            const image_url = product.image_url || null;
            const image_nutrition_url = product.image_nutrition_url || "No image available";
            const nutriments = product.nutriments || {};
            const energy_kcal = nutriments["energy-kcal_100g"] || null;
            const fat = nutriments["fat_100g"] || null;
            const saturated_fat = nutriments["saturated-fat_100g"] || null;
            const sugars = nutriments["sugars_100g"] || null;
            const salt = nutriments["salt_100g"] || null;
            const proteins = nutriments["proteins_100g"] || null;

            // 插入数据库的 SQL 和对应参数
            const query = `
            INSERT INTO Products (code, name, brand, categories, labels, quantity, image_url, image_nutrition_url,
                                  energy_kcal, fat, saturated_fat, sugars, salt, proteins)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              name = VALUES(name),
              brand = VALUES(brand),
              categories = VALUES(categories),
              labels = VALUES(labels),
              quantity = VALUES(quantity),
              image_url = VALUES(image_url),
              image_nutrition_url = VALUES(image_nutrition_url),
              energy_kcal = VALUES(energy_kcal),
              fat = VALUES(fat),
              saturated_fat = VALUES(saturated_fat),
              sugars = VALUES(sugars),
              salt = VALUES(salt),
              proteins = VALUES(proteins),
              updatedAt = CURRENT_TIMESTAMP;
          `;

            const values = [
                code,
                name,
                brand,
                categories,
                labels,
                quantity,
                image_url,
                image_nutrition_url,
                energy_kcal,
                fat,
                saturated_fat,
                sugars,
                salt,
                proteins,
            ];

            await pool.query(query, values);
        }

        console.log(`Page ${page} completed. Moving to the next page...`);

        // 延迟
        await delay(5000);

        // 处理下一页
        await fetchAndInsertProducts(page + 1);

    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);

        // 检查是否达到最大重试次数
        if (retryCount < MAX_RETRY_COUNT) {
            console.log(`Retrying page ${page}... Attempt ${retryCount + 1}`);
            await delay(3000); // 再次尝试之前等待 3 秒
            await fetchAndInsertProducts(page, retryCount + 1);
        } else {
            // 如果超过重试次数，跳过此页面，继续下一页
            console.error(`Failed to fetch page ${page} after ${MAX_RETRY_COUNT} attempts. Skipping to the next page...`);
            await fetchAndInsertProducts(page + 1);
        }
    }
};

// 开始执行脚本
fetchAndInsertProducts();