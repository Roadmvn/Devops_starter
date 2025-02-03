const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const csurf = require('csurf');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// 配置 CORS
app.use(cors({
    origin: 'http://localhost:3000', // 允许的前端地址
    credentials: true, // 允许跨域携带 Cookie
}));

const sessionStore = new SequelizeStore({
    db: sequelize,
});

sessionStore.sync();

app.use(
    session({
        secret: 'JMsgmBe7nbZqw59OPO',
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
    })
);

app.use('/static', express.static('public'));


app.use(express.json());

// 中间件
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 路由挂载
app.use('/auth', authRoutes);
app.use('/api', routes);

// 未找到路由时处理
app.use((req, res, next) => {
    res.status(404).json({ message: '未找到请求的资源！' });
});


// 捕获所有其他错误
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器内部错误！' });
});


// 启动服务器
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`服务器正在运行：http://localhost:${PORT}`);
});