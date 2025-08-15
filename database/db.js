const fs = require('fs'); // 导入文件系统模块
const path = require('path'); // 导入路径处理模块
const bcrypt = require('bcryptjs'); // 导入密码加密模块

// 数据库文件路径
const dbPath = path.join(__dirname, 'data.json'); // 定义数据库文件路径

// 初始化数据结构
const initialData = {
    users: [],
    videos: [],
    play_history: []
}; // 初始化数据结构

// 读取数据库
function readDB() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8'); // 读取数据库文件
            return JSON.parse(data); // 解析JSON数据
        } else {
            return initialData; // 返回初始数据
        }
    } catch (error) {
        console.error('读取数据库错误:', error); // 输出错误信息
        return initialData; // 返回初始数据
    }
}

// 写入数据库
function writeDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2)); // 写入数据库文件
        return true; // 返回成功
    } catch (error) {
        console.error('写入数据库错误:', error); // 输出错误信息
        return false; // 返回失败
    }
}

// 初始化数据库函数
function initDatabase() {
    return new Promise((resolve, reject) => {
        try {
            const data = readDB(); // 读取数据库
            
            // 检查是否已存在管理员账户
            const adminExists = data.users.some(user => user.is_admin); // 检查管理员是否存在
            
            // 如果不存在管理员账户，则创建默认管理员
            if (!adminExists) {
                const hashedPassword = bcrypt.hashSync('admin123', 10); // 加密默认密码
                
                const adminUser = {
                    id: Date.now(), // 使用时间戳作为ID
                    username: 'admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    is_admin: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }; // 创建管理员用户对象
                
                data.users.push(adminUser); // 添加管理员用户
                writeDB(data); // 写入数据库
                
                console.log('默认管理员账户创建成功'); // 输出创建成功信息
                console.log('用户名: admin, 密码: admin123'); // 输出默认登录信息
            }
            
            resolve(); // 解析Promise
        } catch (error) {
            reject(error); // 拒绝Promise
        }
    });
}

// 数据库查询函数
function query(table) {
    try {
        const data = readDB(); // 读取数据库
        return data[table] || []; // 返回表数据
    } catch (error) {
        console.error('查询错误:', error); // 输出错误信息
        return []; // 返回空数组
    }
}

// 数据库单行查询函数
function get(table, condition) {
    try {
        const data = readDB(); // 读取数据库
        const tableData = data[table] || []; // 获取表数据
        
        // 根据条件查找记录
        return tableData.find(record => {
            for (const key in condition) {
                if (record[key] !== condition[key]) {
                    return false; // 条件不匹配
                }
            }
            return true; // 条件匹配
        });
    } catch (error) {
        console.error('查询错误:', error); // 输出错误信息
        return null; // 返回null
    }
}

// 数据库执行函数（插入、更新、删除）
function run(operation, table, data = null, condition = null) {
    try {
        const dbData = readDB(); // 读取数据库
        const tableData = dbData[table] || []; // 获取表数据
        
        let result = { id: null, changes: 0 }; // 初始化结果
        
        switch (operation) {
            case 'INSERT':
                const newRecord = {
                    id: Date.now(), // 使用时间戳作为ID
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }; // 创建新记录
                
                tableData.push(newRecord); // 添加记录
                dbData[table] = tableData; // 更新表数据
                writeDB(dbData); // 写入数据库
                
                result.id = newRecord.id; // 设置ID
                result.changes = 1; // 设置变更数
                break;
                
            case 'UPDATE':
                const updateIndex = tableData.findIndex(record => {
                    for (const key in condition) {
                        if (record[key] !== condition[key]) {
                            return false; // 条件不匹配
                        }
                    }
                    return true; // 条件匹配
                }); // 查找要更新的记录
                
                if (updateIndex !== -1) {
                    tableData[updateIndex] = {
                        ...tableData[updateIndex],
                        ...data,
                        updated_at: new Date().toISOString()
                    }; // 更新记录
                    
                    dbData[table] = tableData; // 更新表数据
                    writeDB(dbData); // 写入数据库
                    
                    result.changes = 1; // 设置变更数
                }
                break;
                
            case 'DELETE':
                const deleteIndex = tableData.findIndex(record => {
                    for (const key in condition) {
                        if (record[key] !== condition[key]) {
                            return false; // 条件不匹配
                        }
                    }
                    return true; // 条件匹配
                }); // 查找要删除的记录
                
                if (deleteIndex !== -1) {
                    tableData.splice(deleteIndex, 1); // 删除记录
                    
                    dbData[table] = tableData; // 更新表数据
                    writeDB(dbData); // 写入数据库
                    
                    result.changes = 1; // 设置变更数
                }
                break;
        }
        
        return result; // 返回结果
    } catch (error) {
        console.error('执行错误:', error); // 输出错误信息
        return { id: null, changes: 0 }; // 返回空结果
    }
}

// 导出模块
module.exports = {
    initDatabase, // 初始化数据库函数
    query, // 查询函数
    get, // 单行查询函数
    run // 执行函数
};
