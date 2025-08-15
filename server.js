const express = require('express'); // 导入Express框架
const session = require('express-session'); // 导入会话管理中间件
const cors = require('cors'); // 导入CORS中间件
const path = require('path'); // 导入路径处理模块
const fs = require('fs'); // 导入文件系统模块

// 导入自定义模块
const authRoutes = require('./routes/auth'); // 导入认证路由
const videoRoutes = require('./routes/videos'); // 导入视频路由
const userRoutes = require('./routes/users'); // 导入用户路由
const { initDatabase } = require('./database/db'); // 导入数据库初始化函数

const app = express(); // 创建Express应用实例
const PORT = process.env.PORT || 3000; // 设置服务器端口

// 检查是否在Vercel环境
const isVercel = process.env.VERCEL === '1';

// 创建必要的目录（仅在非Vercel环境）
if (!isVercel) {
    const uploadsDir = path.join(__dirname, 'uploads');
    const thumbnailsDir = path.join(__dirname, 'uploads', 'thumbnails');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
}

// 中间件配置
app.use(cors({
    origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    credentials: true
}));
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求体

// 静态文件服务
if (!isVercel) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 提供上传文件的静态访问
}
app.use(express.static(path.join(__dirname, 'public'))); // 提供前端静态文件访问

// 会话配置
app.use(session({
    secret: 'your-secret-key-change-in-production', // 会话密钥（生产环境应更改）
    resave: false, // 不强制保存会话
    saveUninitialized: false, // 不保存未初始化的会话
    cookie: {
        secure: isVercel, // Vercel环境使用HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 会话有效期24小时
        sameSite: isVercel ? 'none' : 'lax'
    }
}));

// 路由配置
app.use('/api/auth', authRoutes); // 认证相关路由
app.use('/api/videos', videoRoutes); // 视频相关路由
app.use('/api/users', userRoutes); // 用户相关路由

// 处理静态文件请求
app.get('*.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.get('*.css', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// 默认路由 - 返回前端页面
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 返回前端主页面
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack); // 在控制台输出错误信息
    res.status(500).json({ 
        error: '服务器内部错误', 
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试' 
    }); // 返回错误响应
});

// 启动服务器（仅在非Vercel环境）
if (!isVercel) {
    async function startServer() {
        try {
            await initDatabase(); // 初始化数据库
            console.log('数据库初始化完成'); // 输出数据库初始化成功信息
            
            app.listen(PORT, () => {
                console.log(`服务器运行在 http://localhost:${PORT}`); // 输出服务器启动信息
            });
        } catch (error) {
            console.error('服务器启动失败:', error); // 输出服务器启动失败信息
            process.exit(1); // 退出进程
        }
    }

    startServer();
}

// 导出app（用于Vercel）
module.exports = app;
