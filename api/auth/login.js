const bcrypt = require('bcryptjs');

// 内存数据库（用于Vercel）
const memoryDB = {
  users: [
    {
      id: 1755168092284,
      username: "admin",
      email: "admin@example.com",
      password: "$2a$10$CGRQMkTVhwmlm.be04ObveT8CVxp4AyNUvAXu3xSJWOCLCv20WOOy",
      is_admin: true,
      created_at: "2025-08-14T10:41:32.284Z",
      updated_at: "2025-08-14T10:41:32.287Z"
    }
  ]
};

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }
  
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = memoryDB.users.find(u => 
      u.username === username || u.email === username
    );
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 登录成功
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      },
      message: '登录成功'
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
