const express = require('express'); // 导入Express框架
const multer = require('multer'); // 导入文件上传中间件
const path = require('path'); // 导入路径处理模块
const fs = require('fs'); // 导入文件系统模块
const { query, get, run } = require('../database/db'); // 导入数据库操作函数

const router = express.Router(); // 创建路由实例

// 配置multer文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 设置上传目录
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名，避免冲突
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 生成唯一后缀
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // 设置文件名
    }
}); // 配置存储选项

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的视频格式
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv']; // 定义允许的视频类型
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // 允许上传
    } else {
        cb(new Error('不支持的文件格式，请上传MP4、AVI、MOV、WMV或FLV格式的视频'), false); // 拒绝上传
    }
}; // 文件类型过滤函数

// 创建multer实例
const upload = multer({ 
    storage: storage, // 使用配置的存储
    fileFilter: fileFilter, // 使用文件过滤器
    limits: {
        fileSize: 500 * 1024 * 1024 // 限制文件大小为500MB
    }
}); // 创建上传中间件

// 中间件：检查用户是否登录
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: '请先登录' }); // 返回未登录错误
    }
    next(); // 继续执行下一个中间件
}

// 中间件：检查是否为管理员
function requireAdmin(req, res, next) {
    if (!req.session.isAdmin) {
        return res.status(403).json({ error: '需要管理员权限' }); // 返回权限不足错误
    }
    next(); // 继续执行下一个中间件
}

// 获取视频列表路由
router.get('/', async (req, res) => {
    try {
        // 查询所有视频
        const videos = query('videos'); // 查询视频列表
        
        // 为每个视频添加上传者信息
        const videosWithUploader = videos.map(video => {
            const uploader = get('users', { id: video.uploaded_by }); // 查询上传者信息
            return {
                ...video,
                uploader_name: uploader ? uploader.username : '未知用户'
            }; // 返回视频信息
        });
        
        // 按创建时间倒序排序
        videosWithUploader.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json({ videos: videosWithUploader }); // 返回视频列表
        
    } catch (error) {
        console.error('获取视频列表错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取视频列表失败' }); // 返回错误信息
    }
});

// 获取单个视频信息路由
router.get('/:id', async (req, res) => {
    try {
        const videoId = parseInt(req.params.id); // 获取视频ID
        
        // 查询视频信息
        const video = get('videos', { id: videoId }); // 查询视频详情
        
        if (!video) {
            return res.status(404).json({ error: '视频不存在' }); // 返回视频不存在错误
        }
        
        // 获取上传者信息
        const uploader = get('users', { id: video.uploaded_by }); // 查询上传者信息
        const videoWithUploader = {
            ...video,
            uploader_name: uploader ? uploader.username : '未知用户'
        }; // 构建视频信息对象
        
        // 如果用户已登录，获取播放历史
        let playHistory = null; // 初始化播放历史变量
        if (req.session.userId) {
            playHistory = get('play_history', { 
                user_id: req.session.userId, 
                video_id: videoId 
            }); // 查询播放历史
        }
        
        res.json({ video: videoWithUploader, playHistory }); // 返回视频信息和播放历史
        
    } catch (error) {
        console.error('获取视频信息错误:', error); // 输出错误信息
        res.status(500).json({ error: '获取视频信息失败' }); // 返回错误信息
    }
});

// 上传视频路由（需要管理员权限）
router.post('/upload', requireAuth, requireAdmin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '请选择要上传的视频文件' }); // 返回文件未选择错误
        }
        
        const { title, description } = req.body; // 获取视频信息
        const file = req.file; // 获取上传的文件信息
        
        // 验证输入
        if (!title) {
            return res.status(400).json({ error: '请输入视频标题' }); // 返回标题缺失错误
        }
        
        // 保存视频信息到数据库
        const result = run('INSERT', 'videos', {
            title: title,
            description: description || '',
            filename: file.originalname,
            filepath: file.path,
            thumbnail_path: null,
            duration: 0,
            file_size: file.size,
            uploaded_by: req.session.userId
        }); // 插入视频记录
        
        // 获取新创建的视频信息
        const newVideo = get('videos', { id: result.id }); // 查询新视频信息
        const uploader = get('users', { id: newVideo.uploaded_by }); // 查询上传者信息
        
        const videoWithUploader = {
            ...newVideo,
            uploader_name: uploader ? uploader.username : '未知用户'
        }; // 构建视频信息对象
        
        res.status(201).json({ 
            message: '视频上传成功', 
            video: videoWithUploader 
        }); // 返回上传成功信息
        
    } catch (error) {
        console.error('视频上传错误:', error); // 输出错误信息
        res.status(500).json({ error: '视频上传失败，请稍后重试' }); // 返回错误信息
    }
});

// 删除视频路由（需要管理员权限）
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const videoId = parseInt(req.params.id); // 获取视频ID
        
        // 查询视频信息
        const video = get('videos', { id: videoId }); // 查询视频信息
        if (!video) {
            return res.status(404).json({ error: '视频不存在' }); // 返回视频不存在错误
        }
        
        // 删除视频文件
        if (fs.existsSync(video.filepath)) {
            fs.unlinkSync(video.filepath); // 删除视频文件
        }
        
        // 删除缩略图
        if (video.thumbnail_path && fs.existsSync(video.thumbnail_path)) {
            fs.unlinkSync(video.thumbnail_path); // 删除缩略图文件
        }
        
        // 从数据库删除视频记录
        run('DELETE', 'videos', null, { id: videoId }); // 删除视频记录
        
        res.json({ message: '视频删除成功' }); // 返回删除成功信息
        
    } catch (error) {
        console.error('删除视频错误:', error); // 输出错误信息
        res.status(500).json({ error: '删除视频失败' }); // 返回错误信息
    }
});

// 更新播放进度路由
router.post('/:id/progress', requireAuth, async (req, res) => {
    try {
        const videoId = parseInt(req.params.id); // 获取视频ID
        const { position, duration } = req.body; // 获取播放进度信息
        
        // 检查是否已存在播放历史
        const existingHistory = get('play_history', { 
            user_id: req.session.userId, 
            video_id: videoId 
        }); // 查询播放历史
        
        if (existingHistory) {
            // 更新现有记录
            run('UPDATE', 'play_history', {
                last_position: position,
                watch_duration: duration,
                last_watched: new Date().toISOString()
            }, { 
                user_id: req.session.userId, 
                video_id: videoId 
            }); // 更新播放历史
        } else {
            // 创建新记录
            run('INSERT', 'play_history', {
                user_id: req.session.userId,
                video_id: videoId,
                last_position: position,
                watch_duration: duration,
                last_watched: new Date().toISOString()
            }); // 插入播放历史
        }
        
        res.json({ message: '播放进度已保存' }); // 返回保存成功信息
        
    } catch (error) {
        console.error('保存播放进度错误:', error); // 输出错误信息
        res.status(500).json({ error: '保存播放进度失败' }); // 返回错误信息
    }
});

module.exports = router; // 导出路由模块
