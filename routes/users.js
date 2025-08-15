const express = require('express'); // 导入Express框架
const { query, get, run } = require('../database/db'); // 导入数据库操作函数

const router = express.Router(); // 创建路由实例

// 中间件：检查用户是否登录
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: '请先登录' }); // 返回未登录错误
    }
    next(); // 继续执行下一个中间件
}

// 获取用户播放历史路由
router.get('/history', requireAuth, async (req, res) => {
    try {
        // 查询用户的播放历史
        const allHistory = query('play_history'); // 查询所有播放历史
        const userHistory = allHistory.filter(history => history.user_id === req.session.userId); // 过滤用户历史
        
        // 为每个历史记录添加视频信息
        const historyWithVideos = userHistory.map(history => {
            const video = get('videos', { id: history.video_id }); // 查询视频信息
            return {
                ...history,
                title: video ? video.title : '未知视频',
                thumbnail_path: video ? video.thumbnail_path : null,
                duration: video ? video.duration : 0,
                video_created_at: video ? video.created_at : null
            }; // 返回历史记录
        });
        
        // 按最后观看时间倒序排序
        historyWithVideos.sort((a, b) => new Date(b.last_watched) - new Date(a.last_watched));
        
        res.json({ history: historyWithVideos }); // 返回播放历史
        
    } catch (error) {
        console.error('获取播放历史错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取播放历史失败' }); // 返回错误信息
    }
});

// 清除单个播放历史记录路由
router.delete('/history/:videoId', requireAuth, async (req, res) => {
    try {
        const videoId = parseInt(req.params.videoId); // 获取视频ID
        
        // 删除指定的播放历史记录
        run('DELETE', 'play_history', null, { 
            user_id: req.session.userId, 
            video_id: videoId 
        }); // 删除播放历史记录
        
        res.json({ message: '播放历史已清除' }); // 返回清除成功信息
        
    } catch (error) {
        console.error('清除播放历史错误:', error); // 输出错误信息
        res.status(500).json({ error: '清除播放历史失败' }); // 返回错误信息
    }
});

// 清除所有播放历史记录路由
router.delete('/history', requireAuth, async (req, res) => {
    try {
        // 获取用户的所有播放历史记录
        const allHistory = query('play_history'); // 查询所有播放历史
        const userHistory = allHistory.filter(history => history.user_id === req.session.userId); // 过滤用户历史
        
        // 删除用户的所有播放历史记录
        userHistory.forEach(history => {
            run('DELETE', 'play_history', null, { id: history.id }); // 删除播放历史记录
        });
        
        res.json({ message: '所有播放历史已清除' }); // 返回清除成功信息
        
    } catch (error) {
        console.error('清除所有播放历史错误:', error); // 输出错误信息
        res.status(500).json({ error: '清除播放历史失败' }); // 返回错误信息
    }
});

// 获取用户统计信息路由
router.get('/stats', requireAuth, async (req, res) => {
    try {
        // 获取用户观看视频总数
        const allHistory = query('play_history'); // 查询所有播放历史
        const userHistory = allHistory.filter(history => history.user_id === req.session.userId); // 过滤用户历史
        const totalWatched = new Set(userHistory.map(history => history.video_id)).size; // 计算观看视频总数
        
        // 获取用户总观看时长
        const totalDuration = userHistory.reduce((sum, history) => sum + (history.watch_duration || 0), 0); // 计算总观看时长
        
        // 获取最近观看的视频
        const recentWatched = userHistory
            .sort((a, b) => new Date(b.last_watched) - new Date(a.last_watched)) // 按时间倒序排序
            .slice(0, 5) // 取前5个
            .map(history => {
                const video = get('videos', { id: history.video_id }); // 查询视频信息
                return {
                    title: video ? video.title : '未知视频',
                    last_watched: history.last_watched,
                    last_position: history.last_position,
                    duration: video ? video.duration : 0
                }; // 返回最近观看信息
            });
        
        // 构建统计信息对象
        const stats = {
            totalWatched: totalWatched, // 观看视频总数
            totalDuration: totalDuration, // 总观看时长（秒）
            recentWatched: recentWatched // 最近观看的视频
        }; // 构建统计信息
        
        res.json({ stats }); // 返回统计信息
        
    } catch (error) {
        console.error('获取用户统计信息错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取统计信息失败' }); // 返回错误信息
    }
});

// 更新用户信息路由
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { username, email } = req.body; // 获取更新的用户信息
        
        // 验证输入
        if (!username || !email) {
            return res.status(400).json({ error: '请填写所有必填字段' }); // 返回字段缺失错误
        }
        
        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 邮箱格式正则表达式
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: '请输入有效的邮箱地址' }); // 返回邮箱格式错误
        }
        
        // 检查用户名是否已被其他用户使用
        const existingUser = get('users', { username: username }); // 查询用户名是否被占用
        if (existingUser && existingUser.id !== req.session.userId) {
            return res.status(400).json({ error: '用户名已被使用' }); // 返回用户名占用错误
        }
        
        // 检查邮箱是否已被其他用户使用
        const existingEmail = get('users', { email: email }); // 查询邮箱是否被占用
        if (existingEmail && existingEmail.id !== req.session.userId) {
            return res.status(400).json({ error: '邮箱已被使用' }); // 返回邮箱占用错误
        }
        
        // 更新用户信息
        run('UPDATE', 'users', {
            username: username,
            email: email
        }, { id: req.session.userId }); // 更新用户信息
        
        // 更新会话中的用户名
        req.session.username = username; // 更新会话中的用户名
        
        // 获取更新后的用户信息
        const updatedUser = get('users', { id: req.session.userId }); // 查询更新后的用户信息
        
        res.json({ 
            message: '用户信息更新成功', 
            user: updatedUser 
        }); // 返回更新成功信息
        
    } catch (error) {
        console.error('更新用户信息错误:', error); // 输出错误信息
        res.status(500).json({ error: '更新用户信息失败' }); // 返回错误信息
    }
});

// 修改密码路由
router.put('/password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body; // 获取密码信息
        
        // 验证输入
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: '请填写所有密码字段' }); // 返回字段缺失错误
        }
        
        // 验证新密码长度
        if (newPassword.length < 8) {
            return res.status(400).json({ error: '新密码长度至少8位' }); // 返回密码长度错误
        }
        
        // 获取当前用户信息
        const user = get('users', { id: req.session.userId }); // 查询用户密码
        
        // 验证当前密码
        const bcrypt = require('bcryptjs'); // 导入密码加密模块
        const isValidPassword = bcrypt.compareSync(currentPassword, user.password); // 验证当前密码
        if (!isValidPassword) {
            return res.status(400).json({ error: '当前密码错误' }); // 返回密码错误信息
        }
        
        // 加密新密码
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10); // 加密新密码
        
        // 更新密码
        run('UPDATE', 'users', {
            password: hashedNewPassword
        }, { id: req.session.userId }); // 更新密码
        
        res.json({ message: '密码修改成功' }); // 返回修改成功信息
        
    } catch (error) {
        console.error('修改密码错误:', error); // 输出错误信息
        res.status(500).json({ error: '修改密码失败' }); // 返回错误信息
    }
});

// 获取用户收藏列表路由（预留功能）
router.get('/favorites', requireAuth, async (req, res) => {
    try {
        // 这里可以扩展收藏功能
        res.json({ favorites: [] }); // 返回空收藏列表
        
    } catch (error) {
        console.error('获取收藏列表错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取收藏列表失败' }); // 返回错误信息
    }
});

module.exports = router; // 导出路由模块
