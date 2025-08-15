const express = require('express'); // 导入Express框架
const bcrypt = require('bcryptjs'); // 导入密码加密模块
const { query, get, run } = require('../database/db'); // 导入数据库操作函数

const router = express.Router(); // 创建路由实例

// 用户注册路由
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // 从请求体中获取注册信息
        
        // 验证输入数据
        if (!username || !email || !password) {
            return res.status(400).json({ error: '请填写所有必填字段' }); // 返回错误信息
        }
        
        // 验证密码长度
        if (password.length < 8) {
            return res.status(400).json({ error: '密码长度至少8位' }); // 返回错误信息
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 邮箱格式正则表达式
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '请输入有效的邮箱地址' }); // 返回错误信息
        }
        
        // 检查用户名是否已存在
        const existingUser = get('users', { username: username }); // 查询用户名是否存在
        if (existingUser) {
            return res.status(400).json({ error: '用户名已存在' }); // 返回错误信息
        }
        
        // 检查邮箱是否已存在
        const existingEmail = get('users', { email: email }); // 查询邮箱是否存在
        if (existingEmail) {
            return res.status(400).json({ error: '邮箱已被注册' }); // 返回错误信息
        }
        
        // 加密密码
        const hashedPassword = bcrypt.hashSync(password, 10); // 使用bcrypt加密密码
        
        // 插入新用户
        const result = run('INSERT', 'users', {
            username: username,
            email: email,
            password: hashedPassword,
            is_admin: false
        }); // 插入用户数据
        
        // 获取新创建的用户信息（不包含密码）
        const newUser = get('users', { id: result.id }); // 查询新用户信息
        const userInfo = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            is_admin: newUser.is_admin,
            created_at: newUser.created_at
        }; // 构建用户信息对象
        
        // 设置会话
        req.session.userId = newUser.id; // 设置用户ID到会话
        req.session.username = newUser.username; // 设置用户名到会话
        req.session.isAdmin = newUser.is_admin; // 设置管理员状态到会话
        
        res.status(201).json({ 
            message: '注册成功', 
            user: userInfo 
        }); // 返回成功信息
        
    } catch (error) {
        console.error('注册错误:', error); // 输出错误信息
        res.status(500).json({ error: '注册失败，请稍后重试' }); // 返回错误信息
    }
});

// 用户登录路由
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body; // 从请求体中获取登录信息
        
        // 验证输入数据
        if (!username || !password) {
            return res.status(400).json({ error: '请填写用户名和密码' }); // 返回错误信息
        }
        
        // 查询用户（支持用户名或邮箱登录）
        const user = get('users', { username: username }) || get('users', { email: username }); // 查询用户信息
        
        // 检查用户是否存在
        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' }); // 返回错误信息
        }
        
        // 验证密码
        const isValidPassword = bcrypt.compareSync(password, user.password); // 比较密码
        if (!isValidPassword) {
            return res.status(401).json({ error: '用户名或密码错误' }); // 返回错误信息
        }
        
        // 设置会话
        req.session.userId = user.id; // 设置用户ID到会话
        req.session.username = user.username; // 设置用户名到会话
        req.session.isAdmin = user.is_admin; // 设置管理员状态到会话
        
        // 如果选择记住我，延长会话时间
        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
        }
        
        // 返回用户信息（不包含密码）
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin
        }; // 构建用户信息对象
        
        res.json({ 
            message: '登录成功', 
            user: userInfo 
        }); // 返回成功信息
        
    } catch (error) {
        console.error('登录错误:', error); // 输出错误信息
        res.status(500).json({ error: '登录失败，请稍后重试' }); // 返回错误信息
    }
});

// 用户登出路由
router.post('/logout', (req, res) => {
    req.session.destroy((err) => { // 销毁会话
        if (err) {
            console.error('登出错误:', err); // 输出错误信息
            return res.status(500).json({ error: '登出失败' }); // 返回错误信息
        }
        res.json({ message: '登出成功' }); // 返回成功信息
    });
});

// 获取当前用户信息路由
router.get('/me', async (req, res) => {
    try {
        // 检查用户是否已登录
        if (!req.session.userId) {
            return res.status(401).json({ error: '未登录' }); // 返回未登录错误
        }
        
        // 查询用户信息
        const user = get('users', { id: req.session.userId }); // 查询用户信息
        
        if (!user) {
            return res.status(404).json({ error: '用户不存在' }); // 返回用户不存在错误
        }
        
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            created_at: user.created_at
        }; // 构建用户信息对象
        
        res.json({ user: userInfo }); // 返回用户信息
        
    } catch (error) {
        console.error('获取用户信息错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取用户信息失败' }); // 返回错误信息
    }
});

// 检查登录状态路由
router.get('/check', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            isLoggedIn: true, 
            user: {
                id: req.session.userId,
                username: req.session.username,
                isAdmin: req.session.isAdmin
            }
        }); // 返回已登录状态
    } else {
        res.json({ isLoggedIn: false }); // 返回未登录状态
    }
});

module.exports = router; // 导出路由模块
