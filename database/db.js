const fs = require('fs');
const path = require('path');

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'data.json');

// 内存数据库（用于Vercel等无服务器环境）
let memoryDB = {
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
      created_at: "2025-08-14T11:11:12.969Z",
      updated_at: "2025-08-14T11:11:12.969Z"
    }
  ],
  play_history: []
};

// 检查是否在Vercel环境
const isVercel = process.env.VERCEL === '1';

/**
 * 读取数据库
 */
function readDB() {
  try {
    if (isVercel) {
      // Vercel环境使用内存数据库
      return memoryDB;
    }
    
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
    return { users: [], videos: [], play_history: [] };
  } catch (error) {
    console.error('读取数据库失败:', error);
    return { users: [], videos: [], play_history: [] };
  }
}

/**
 * 写入数据库
 */
function writeDB(data) {
  try {
    if (isVercel) {
      // Vercel环境更新内存数据库
      memoryDB = data;
      return true;
    }
    
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据库失败:', error);
    return false;
  }
}

/**
 * 初始化数据库
 */
function initDatabase() {
  try {
    const data = readDB();
    
    // 确保数据库结构完整
    if (!data.users) data.users = [];
    if (!data.videos) data.videos = [];
    if (!data.play_history) data.play_history = [];
    
    // 创建默认管理员用户
    createDefaultAdmin(data);
    
    writeDB(data);
    console.log('数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
}

/**
 * 创建默认管理员用户
 */
function createDefaultAdmin(data) {
  const adminExists = data.users.find(user => user.username === 'admin');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    data.users.push({
      id: Date.now(),
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      is_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * 查询数据
 */
function query(table, conditions = {}) {
  try {
    const data = readDB();
    let results = data[table] || [];
    
    // 应用过滤条件
    Object.keys(conditions).forEach(key => {
      results = results.filter(item => item[key] === conditions[key]);
    });
    
    return results;
  } catch (error) {
    console.error('查询失败:', error);
    return [];
  }
}

/**
 * 获取单条记录
 */
function get(table, conditions = {}) {
  try {
    const results = query(table, conditions);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('获取记录失败:', error);
    return null;
  }
}

/**
 * 执行插入、更新、删除操作
 */
function run(operation, table, data = {}) {
  try {
    const dbData = readDB();
    
    if (!dbData[table]) {
      dbData[table] = [];
    }
    
    switch (operation.toUpperCase()) {
      case 'INSERT':
        const newItem = {
          id: Date.now(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        dbData[table].push(newItem);
        break;
        
      case 'UPDATE':
        const { id, ...updateData } = data;
        const index = dbData[table].findIndex(item => item.id == id);
        if (index !== -1) {
          dbData[table][index] = {
            ...dbData[table][index],
            ...updateData,
            updated_at: new Date().toISOString()
          };
        }
        break;
        
      case 'DELETE':
        const { id: deleteId } = data;
        dbData[table] = dbData[table].filter(item => item.id != deleteId);
        break;
    }
    
    return writeDB(dbData);
  } catch (error) {
    console.error('执行操作失败:', error);
    return false;
  }
}

module.exports = {
  initDatabase,
  query,
  get,
  run,
  readDB,
  writeDB
};
