const express = require('express');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { addListener } = require('process');
const app = express();
const PORT = 8080;

// 创建数据库连接
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,  // 您的数据库用户名
    password: process.env.DB_PASSWORD,  // 您的数据库密码
    database: process.env.DB_NAME,  // 您的数据库名
    ssl: {
        rejectUnauthorized: true
    }
});

// 连接数据库
connection.connect(err => {
    if (err) {
        return console.error('数据库连接失败:', err);
    }
    console.log('成功连接到数据库');
});

// 添加CORS中间件
app.use(cors());

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 图片请求处理
app.use("/images", express.static(path.join(__dirname, 'images')));

// 用于解析JSON格式的请求体
app.use(express.json());

// 获取所有产品信息的API
app.get('/api/products', (req, res) => {
    connection.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('查询产品时出错:', err);
            return res.status(500).json({ error: '获取产品数据失败' });
        }
        res.json(results);
    });
});



// 获取所有产品信息的API
app.get('/api/cart', (req, res) => {
    connection.query('SELECT * FROM cart', (err, results) => {
        if (err) {
            console.error('查询产品时出错:', err);
            return res.status(500).json({ error: '获取产品数据失败' });
        }
        res.json(results);
    });
});




// 添加产品到购物车的API
app.post('/api/cart', (req, res) => {
    const { product_id, product_name, product_price, product_num } = req.body;
    const sql = 'INSERT INTO cart (product_id, product_name, product_price, product_num) VALUES (?, ?, ?, ?)';
    
    connection.query(sql, [product_id, product_name, product_price, product_num], (err, result) => {
        if (err) {
            console.error('添加到购物车失败:', err);
            return res.status(500).json({ error: '添加到购物车失败' });
        }
        res.json({ message: '商品已成功添加到购物车', id: result.insertId });
    });
});




// 根路由发送index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器成功启动，运行在 http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('服务器启动失败:', err);
});





// server.js 或相应的后端文件
app.delete('/api/cart/:product_del_id', (req, res) => {
    //console.log("Product ID:" + req.params.product_del_id);
    
    const productId = req.params.product_del_id;
    try {
        // 假设您使用 MySQL 数据库
        const sql = 'DELETE FROM cart WHERE product_id = ?';
        connection.query(sql, [productId], (err, result) => {
            if (err) {
                console.error('数据库错误:', err); // 打印错误信息
                return res.status(500).json({ error: '删除商品失败' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: '未找到该商品' }); // 如果没有找到商品
            }
            res.status(200).json({ message: '商品已成功移除' });
        });
    } catch (error) {
        console.error('删除商品时出错: 2', error);
        //res.status(500).json({ error: '删除商品失败' });
    }
});

