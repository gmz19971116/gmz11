const express = require('express'); // 导入Express框架
const session = require('express-session'); // 导入会话管理中间件
const cors = require('cors'); // 导入CORS中间件
const path = require('path'); // 导入路径处理模块
const fs = require('fs'); // 导入文件系统模块
const bcrypt = require('bcryptjs'); // 导入bcryptjs用于密码哈希

// 导入自定义模块
const authRoutes = require('./routes/auth'); // 导入认证路由
const videoRoutes = require('./routes/videos'); // 导入视频路由
const userRoutes = require('./routes/users'); // 导入用户路由
const { initDatabase } = require('./database/db'); // 导入数据库初始化函数

const app = express(); // 创建Express应用实例
const PORT = process.env.PORT || 3000; // 设置服务器端口

// 检查是否在Vercel环境
const isVercel = process.env.VERCEL === '1';

// 内存数据库（用于Vercel）
const memoryDB = {
  users: [
    {
      id: 1755168092284,
      username: "admin",
      email: "1348155504@qq.com",
      password: "$2a$10$CGRQMkTVhwmlm.be04ObveT8CVxp4AyNUvAXu3xSJWOCLCv20WOOy",
      is_admin: true,
      created_at: "2025-08-14T10:41:32.284Z",
      updated_at: "2025-08-14T10:41:32.287Z"
    }
  ],
  videos: [
    {
      id: 1755169872969,
      title: "yu",
      description: "123",
      filename: "VID_20250801_123814.mp4",
      filepath: "uploads/video-1755169872314-936489181.mp4",
      thumbnail_path: null,
      duration: 0,
      file_size: 105331857,
      uploaded_by: 1755168092284,
      uploader_name: "admin",
      created_at: "2025-08-14T11:11:12.969Z",
      updated_at: "2025-08-14T11:11:12.969Z"
    }
  ]
};

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
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// 静态文件路由（优先级最高）
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

app.get('/favicon.ico', (req, res) => {
    // 如果favicon文件不存在，返回204状态码（无内容）
    const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
        res.sendFile(faviconPath);
    } else {
        // 返回204状态码，表示无内容但成功
        res.status(204).end();
    }
});

app.use(express.static(path.join(__dirname, 'public')));

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

// API路由处理（Vercel环境）
if (isVercel) {
  // 登录API
  app.post('/api/auth/login', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
      }
      
      const user = memoryDB.users.find(u => 
        u.username === username || u.email === username
      );
      
      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }
      
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_admin: user.is_admin,
          isAdmin: user.is_admin
        },
        message: '登录成功'
      });
      
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });

  // 状态检查API
  app.get('/api/auth/status', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    try {
      // 在Vercel环境中，不自动登录，需要用户手动登录
      res.status(200).json({
        authenticated: false,
        user: null
      });
    } catch (error) {
      console.error('状态检查错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });

  // 退出登录API
  app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    try {
      res.status(200).json({
        success: true,
        message: '退出登录成功'
      });
    } catch (error) {
      console.error('退出登录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });

  // 用户注册API
  app.post('/api/auth/register', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
      }
      
      // 检查用户是否已存在
      const existingUser = memoryDB.users.find(u => 
        u.username === username || u.email === email
      );
      
      if (existingUser) {
        return res.status(400).json({ error: '用户名或邮箱已存在' });
      }
      
      // 创建新用户
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Date.now(),
        username: username,
        email: email,
        password: hashedPassword,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      memoryDB.users.push(newUser);
      
      res.status(201).json({
        success: true,
        message: '注册成功',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          is_admin: newUser.is_admin
        }
      });
      
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });

  // 视频列表API
  app.get('/api/videos', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    res.status(200).json({
      success: true,
      videos: memoryDB.videos
    });
  });

  // 视频上传API
  app.post('/api/videos', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    const { title, description, videoUrl, filename, fileSize } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '视频标题不能为空' });
    }
    
    const newVideo = {
      id: Date.now(),
      title: title,
      description: description || '',
      filename: filename || 'video.mp4',
      filepath: videoUrl || 'uploads/sample-video.mp4', // 使用videoUrl作为filepath
      videoUrl: videoUrl, // 存储原始视频URL
      thumbnail_path: null,
      duration: 0,
      file_size: fileSize || 0,
      uploaded_by: 1755168092284,
      uploader_name: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    memoryDB.videos.push(newVideo);
    res.status(201).json({
      success: true,
      video: newVideo,
      message: '视频上传成功'
    });
  });

  // 视频删除API
  app.delete('/api/videos/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    const videoId = req.params.id;
    const videoIndex = memoryDB.videos.findIndex(v => v.id == videoId);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: '视频不存在' });
    }
    
    memoryDB.videos.splice(videoIndex, 1);
    res.status(200).json({
      success: true,
      message: '视频删除成功'
    });
  });

  // 获取单个视频详情API
  app.get('/api/videos/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    const videoId = req.params.id;
    console.log('查找视频ID:', videoId, '类型:', typeof videoId);
    console.log('当前内存数据库中的视频:', memoryDB.videos.map(v => ({ id: v.id, title: v.title, idType: typeof v.id })));
    
    // 尝试多种匹配方式
    let video = memoryDB.videos.find(v => v.id == videoId); // 宽松匹配
    if (!video) {
      video = memoryDB.videos.find(v => v.id === parseInt(videoId)); // 数字匹配
    }
    if (!video) {
      video = memoryDB.videos.find(v => v.id === videoId); // 严格匹配
    }
    
    if (!video) {
      console.log('未找到视频，返回404');
      return res.status(404).json({ error: '视频不存在' });
    }
    
    console.log('找到视频:', video.title);
    res.status(200).json({
      success: true,
      video: video
    });
  });
} else {
  // 本地环境使用原有路由
  app.use('/api/auth', authRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/users', userRoutes);
}

// 处理静态文件请求（确保在Vercel环境中也能工作）
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

app.get('*.html', (req, res) => {
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
