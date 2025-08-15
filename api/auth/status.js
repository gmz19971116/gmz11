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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }
  
  try {
    // 返回默认管理员用户信息（简化版本）
    res.status(200).json({
      authenticated: true,
      user: {
        id: memoryDB.users[0].id,
        username: memoryDB.users[0].username,
        email: memoryDB.users[0].email,
        is_admin: memoryDB.users[0].is_admin
      }
    });
    
  } catch (error) {
    console.error('状态检查错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
