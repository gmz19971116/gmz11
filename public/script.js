// 全局变量
let currentUser = null;
let videos = [];

// JSONBin.io配置
const JSONBIN_CONFIG = {
    BIN_ID: localStorage.getItem('jsonbin_bin_id') || '', // 从本地存储读取
    API_KEY: localStorage.getItem('jsonbin_api_key') || '', // 从本地存储读取
    BASE_URL: 'https://api.jsonbin.io/v3/b'
};

// 从云数据库加载数据
async function loadFromCloudDatabase() {
    console.log('开始从云数据库加载数据...');
    
    // 检查配置是否完整
    if (!JSONBIN_CONFIG.BIN_ID || !JSONBIN_CONFIG.API_KEY) {
        console.log('JSONBin.io未配置，使用默认数据');
        // 使用默认示例视频
        videos = [
            {
                id: 1,
                title: "示例视频 - Big Buck Bunny",
                description: "这是一个示例视频，用于演示平台功能",
                filename: "sample1.mp4",
                filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail_path: null,
                duration: 596,
                file_size: 1024000,
                uploaded_by: 1755168092284,
                uploader_name: "admin",
                created_at: "2024-01-01T00:00:00.000Z",
                updated_at: "2024-01-01T00:00:00.000Z"
            },
            {
                id: 2,
                title: "示例视频 - Elephants Dream",
                description: "另一个示例视频，展示平台功能",
                filename: "sample2.mp4",
                filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail_path: null,
                duration: 653,
                file_size: 1024000,
                uploaded_by: 1755168092284,
                uploader_name: "admin",
                created_at: "2024-01-01T00:00:00.000Z",
                updated_at: "2024-01-01T00:00:00.000Z"
            }
        ];
        return false;
    }
    
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('从云数据库加载成功:', data);
            
            if (data.record && data.record.videos && Array.isArray(data.record.videos)) {
                videos = data.record.videos;
                console.log('加载到', videos.length, '个视频');
                return true;
            } else {
                console.log('云数据库中没有视频数据，使用默认数据');
                videos = [
                    {
                        id: 1,
                        title: "示例视频 - Big Buck Bunny",
                        description: "这是一个示例视频，用于演示平台功能",
                        filename: "sample1.mp4",
                        filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                        thumbnail_path: null,
                        duration: 596,
                        file_size: 1024000,
                        uploaded_by: 1755168092284,
                        uploader_name: "admin",
                        created_at: "2024-01-01T00:00:00.000Z",
                        updated_at: "2024-01-01T00:00:00.000Z"
                    },
                    {
                        id: 2,
                        title: "示例视频 - Elephants Dream",
                        description: "另一个示例视频，展示平台功能",
                        filename: "sample2.mp4",
                        filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                        thumbnail_path: null,
                        duration: 653,
                        file_size: 1024000,
                        uploaded_by: 1755168092284,
                        uploader_name: "admin",
                        created_at: "2024-01-01T00:00:00.000Z",
                        updated_at: "2024-01-01T00:00:00.000Z"
                    }
                ];
                return false;
            }
        } else {
            console.error('云数据库加载失败:', response.status, response.statusText);
            // 使用默认数据
            videos = [
                {
                    id: 1,
                    title: "示例视频 - Big Buck Bunny",
                    description: "这是一个示例视频，用于演示平台功能",
                    filename: "sample1.mp4",
                    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    thumbnail_path: null,
                    duration: 596,
                    file_size: 1024000,
                    uploaded_by: 1755168092284,
                    uploader_name: "admin",
                    created_at: "2024-01-01T00:00:00.000Z",
                    updated_at: "2024-01-01T00:00:00.000Z"
                },
                {
                    id: 2,
                    title: "示例视频 - Elephants Dream",
                    description: "另一个示例视频，展示平台功能",
                    filename: "sample2.mp4",
                    filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    thumbnail_path: null,
                    duration: 653,
                    file_size: 1024000,
                    uploaded_by: 1755168092284,
                    uploader_name: "admin",
                    created_at: "2024-01-01T00:00:00.000Z",
                    updated_at: "2024-01-01T00:00:00.000Z"
                }
            ];
            return false;
        }
    } catch (error) {
        console.error('云数据库加载出错:', error);
        // 使用默认数据
        videos = [
            {
                id: 1,
                title: "示例视频 - Big Buck Bunny",
                description: "这是一个示例视频，用于演示平台功能",
                filename: "sample1.mp4",
                filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail_path: null,
                duration: 596,
                file_size: 1024000,
                uploaded_by: 1755168092284,
                uploader_name: "admin",
                created_at: "2024-01-01T00:00:00.000Z",
                updated_at: "2024-01-01T00:00:00.000Z"
            },
            {
                id: 2,
                title: "示例视频 - Elephants Dream",
                description: "另一个示例视频，展示平台功能",
                filename: "sample2.mp4",
                filepath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail_path: null,
                duration: 653,
                file_size: 1024000,
                uploaded_by: 1755168092284,
                uploader_name: "admin",
                created_at: "2024-01-01T00:00:00.000Z",
                updated_at: "2024-01-01T00:00:00.000Z"
            }
        ];
        return false;
    }
}

// 保存到云数据库
async function saveToCloudDatabase() {
    console.log('开始保存到云数据库...');
    
    // 检查配置是否完整
    if (!JSONBIN_CONFIG.BIN_ID || !JSONBIN_CONFIG.API_KEY) {
        console.log('JSONBin.io未配置，无法保存到云数据库');
        return false;
    }
    
    try {
        // 确保videos数组存在
        if (!videos || !Array.isArray(videos)) {
            videos = [];
        }
        
        const dataToSave = {
            videos: videos,
            users: [
                {
                    id: 1755168092284,
                    username: "admin",
                    email: "admin@example.com",
                    password_hash: "$2a$10$example",
                    is_admin: true,
                    created_at: "2024-01-01T00:00:00.000Z"
                }
            ],
            lastUpdated: new Date().toISOString()
        };
        
        console.log('准备保存的数据:', dataToSave);
        
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('保存到云数据库成功:', result);
            return true;
        } else {
            console.error('保存到云数据库失败:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('错误详情:', errorText);
            return false;
        }
    } catch (error) {
        console.error('保存到云数据库出错:', error);
        return false;
    }
}

// 显示设置模态框
function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 保存设置
function saveSettings() {
    const binId = document.getElementById('jsonbinBinId').value.trim();
    const apiKey = document.getElementById('jsonbinApiKey').value.trim();
    
    if (!binId || !apiKey) {
        showMessage('请填写完整的JSONBin.io配置信息', 'error');
        return;
    }
    
    // 保存到本地存储
    localStorage.setItem('jsonbin_bin_id', binId);
    localStorage.setItem('jsonbin_api_key', apiKey);
    
    // 更新配置对象
    JSONBIN_CONFIG.BIN_ID = binId;
    JSONBIN_CONFIG.API_KEY = apiKey;
    
    showMessage('设置保存成功！', 'success');
    closeModal('settingsModal');
    
    // 重新加载数据
    loadFromCloudDatabase().then(() => {
        displayVideos(videos);
    });
}

// 测试连接
async function testConnection() {
    const binId = document.getElementById('jsonbinBinId').value.trim();
    const apiKey = document.getElementById('jsonbinApiKey').value.trim();
    
    if (!binId || !apiKey) {
        showMessage('请先填写JSONBin.io配置信息', 'error');
        return;
    }
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showMessage('连接测试成功！', 'success');
        } else {
            showMessage(`连接测试失败: ${response.status} ${response.statusText}`, 'error');
        }
    } catch (error) {
        console.error('连接测试失败:', error);
        showMessage('连接测试失败，请检查配置信息', 'error');
    }
}

// 加载设置
function loadSettings() {
    const binId = localStorage.getItem('jsonbin_bin_id') || '';
    const apiKey = localStorage.getItem('jsonbin_api_key') || '';
    
    const binIdInput = document.getElementById('jsonbinBinId');
    const apiKeyInput = document.getElementById('jsonbinApiKey');
    
    if (binIdInput) binIdInput.value = binId;
    if (apiKeyInput) apiKeyInput.value = apiKey;
    
    // 更新配置对象
    JSONBIN_CONFIG.BIN_ID = binId;
    JSONBIN_CONFIG.API_KEY = apiKey;
    
    console.log('加载设置完成:', { binId: binId ? '已设置' : '未设置', apiKey: apiKey ? '已设置' : '未设置' });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSettings(); // 加载设置
    loadFromCloudDatabase(); // 从云数据库加载
    checkAuthStatus();
    loadVideos();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 导航链接点击事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // 搜索框回车事件
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchVideos();
        }
    });
}

// 检查认证状态（Firebase版本）
async function checkAuthStatus() {
    try {
        // 检查Firebase认证状态
        const firebaseUser = FirebaseAuth.getCurrentUser();
        
        if (firebaseUser) {
            // 用户已通过Firebase认证
            currentUser = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                username: firebaseUser.displayName || firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                is_admin: firebaseUser.email === 'admin@example.com' || firebaseUser.email.endsWith('@admin.com')
            };
            
            updateUIForLoggedInUser();
            loadVideos();
        } else {
            // 检查本地存储的用户信息
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                updateUIForLoggedInUser();
                loadVideos();
            } else {
                updateUIForLoggedOutUser();
            }
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        updateUIForLoggedOutUser();
    }
}

// 更新UI为已登录状态（Firebase版本）
function updateUIForLoggedInUser() {
    console.log('更新UI为已登录状态:', currentUser);
    
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.displayName || currentUser.email;
    
    const isAdmin = currentUser.is_admin || currentUser.isAdmin;
    console.log('用户权限检查 - is_admin:', currentUser.is_admin, 'isAdmin:', currentUser.isAdmin, '最终结果:', isAdmin);
    
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) {
        console.log('找到adminMenu元素，用户isAdmin:', isAdmin);
        if (isAdmin) {
            adminMenu.style.display = 'flex';
            console.log('显示管理员菜单');
        } else {
            adminMenu.style.display = 'none';
            console.log('隐藏管理员菜单');
        }
    } else {
        console.log('未找到adminMenu元素');
    }
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) {
        adminMenu.style.display = 'none';
    }
    
    currentUser = null;
}

// 显示页面
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// 加载视频列表
async function loadVideos() {
    try {
        console.log('开始加载视频列表...');
        
        if (videos && videos.length > 0) {
            console.log('使用本地视频数据:', videos.length, '个视频');
            displayVideos(videos);
            return;
        }
        
        await loadFromCloudDatabase();
        displayVideos(videos);
        
    } catch (error) {
        console.error('加载视频列表失败:', error);
        showMessage('加载视频列表失败', 'error');
    }
}

// 显示视频列表
function displayVideos(videoList) {
    console.log('显示视频列表:', videoList);
    const videosGrid = document.getElementById('videosGrid');
    
    if (!videosGrid) {
        console.error('未找到videosGrid元素');
        return;
    }
    
    videosGrid.innerHTML = '';
    
    if (!videoList || videoList.length === 0) {
        videosGrid.innerHTML = '<p class="no-videos">暂无视频</p>';
        console.log('没有视频可显示');
        return;
    }
    
    videoList.forEach(video => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
    
    console.log(`显示了 ${videoList.length} 个视频`);
}

// 创建视频卡片
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    const duration = formatDuration(video.duration);
    const uploadDate = formatDate(video.created_at);
    
    const isAdmin = currentUser && (currentUser.is_admin || currentUser.isAdmin);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            ${video.thumbnail_path ? 
                `<img src="/${video.thumbnail_path}" alt="${video.title}" onerror="this.style.display='none'">` : 
                '<i class="fas fa-play-circle" style="font-size: 3rem;"></i>'
            }
        </div>
        <div class="video-info">
            <div class="video-title">${video.title}</div>
            <div class="video-meta">
                <span>${video.uploader_name || '未知用户'}</span>
                <span>${duration}</span>
                <span>${uploadDate}</span>
            </div>
            ${isAdmin ? `
                <div class="video-actions">
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteVideo(${video.id})">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', function(e) {
        if (e.target.closest('.video-actions')) {
            return;
        }
        console.log('视频卡片被点击，播放视频:', video.id);
        playVideo(video.id);
    });
    
    return card;
}

// 播放视频
async function playVideo(videoId) {
    console.log('尝试播放视频:', videoId);
    
    // 清理之前的iframe播放器
    const existingIframe = document.querySelector('.video-player iframe');
    if (existingIframe) {
        existingIframe.remove();
    }
    
    // 恢复原生video元素显示
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        videoPlayer.style.display = 'block';
    }
    
    try {
        const video = videos.find(v => v.id == videoId);
        
        if (!video) {
            console.error('未找到视频:', videoId);
            showMessage('视频不存在', 'error');
            return;
        }
        
        console.log('找到视频:', video.id);
        console.log('切换到播放页面');
        
        showPage('player');
        
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');
        const videoDate = document.getElementById('videoDate');
        const videoUploader = document.getElementById('videoUploader');
        
        if (videoTitle) videoTitle.textContent = video.title;
        if (videoDescription) videoDescription.textContent = video.description || '暂无描述';
        if (videoUploader) videoUploader.textContent = `上传者: ${video.uploader_name}`;
        if (videoDate) videoDate.textContent = `上传时间: ${formatDate(video.created_at)}`;
        
        const videoPlayer = document.getElementById('videoPlayer');
        const videoSource = document.getElementById('videoSource');
        
        if (videoPlayer && videoSource) {
            let videoSrc = '';
            
            if (video.videoUrl) {
                videoSrc = video.videoUrl;
                console.log('使用视频URL:', videoSrc);
                
                // 检查是否是blob URL（本地文件）
                if (videoSrc.startsWith('blob:')) {
                    console.log('检测到blob URL（本地文件）');
                    showMessage('这是本地文件，刷新页面后无法播放。建议使用在线视频链接。', 'warning');
                }
                
                // 特殊处理Google Drive链接
                if (videoSrc.includes('drive.google.com')) {
                    console.log('检测到Google Drive链接，使用iframe播放器');
                    
                    const driveValidation = validateGoogleDriveLink(videoSrc);
                    
                    if (driveValidation.isValid) {
                        const fileId = driveValidation.fileId;
                        
                        // 隐藏原生video元素
                        videoPlayer.style.display = 'none';
                        
                        // 创建iframe播放器
                        const iframePlayer = document.createElement('iframe');
                        iframePlayer.src = `https://drive.google.com/file/d/${fileId}/preview`;
                        iframePlayer.width = '100%';
                        iframePlayer.height = '400';
                        iframePlayer.style.border = 'none';
                        iframePlayer.style.borderRadius = '8px';
                        iframePlayer.allowFullscreen = true;
                        
                        // 将iframe插入到video元素的位置
                        const videoContainer = videoPlayer.parentElement;
                        videoContainer.insertBefore(iframePlayer, videoPlayer);
                        
                        console.log('Google Drive iframe播放器已创建:', iframePlayer.src);
                        showMessage('Google Drive视频已加载，请使用iframe播放器观看', 'info');
                        return; // 跳过原生video处理
                    } else {
                        console.error('Google Drive链接无效:', driveValidation.message);
                        showMessage(driveValidation.message, 'error');
                        return;
                    }
                }
            } else {
                // 使用Google的可靠示例视频
                videoSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                console.log('使用示例视频:', videoSrc);
            }
            
            // 设置视频源
            videoSource.src = videoSrc;
            videoPlayer.load();
            console.log('视频源已设置:', videoSource.src);
            
            // 添加错误处理
            videoPlayer.onerror = function() {
                console.error('视频加载失败:', videoSrc);
                
                if (videoSrc.startsWith('blob:')) {
                    showMessage('本地文件已失效，请重新上传或使用在线视频链接', 'error');
                } else {
                    showMessage('视频加载失败，请检查链接或稍后重试', 'error');
                }
            };
            
            videoPlayer.onloadstart = function() {
                console.log('开始加载视频');
            };
            
            videoPlayer.oncanplay = function() {
                console.log('视频可以播放');
                // 视频可以播放时，提示用户点击播放
                showMessage('视频已加载完成，请点击播放按钮开始播放', 'info');
            };
            
            // 不自动播放，让用户手动点击
            console.log('视频已设置，请手动点击播放按钮');
            showMessage('视频已设置，请点击播放按钮开始播放', 'info');
            
        } else {
            console.error('未找到视频播放器元素');
            showMessage('视频播放器加载失败', 'error');
        }
        
    } catch (error) {
        console.error('播放视频失败:', error);
        showMessage('播放失败，请稍后重试', 'error');
    }
}

// 搜索视频
function searchVideos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        displayVideos(videos);
        return;
    }
    
    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm) || 
        (video.description && video.description.toLowerCase().includes(searchTerm))
    );
    
    displayVideos(filteredVideos);
}

// 验证Google Drive链接格式
function validateGoogleDriveLink(url) {
    // 检查是否为有效的Google Drive文件链接
    const filePattern = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(filePattern);
    
    if (match) {
        return {
            isValid: true,
            fileId: match[1],
            type: 'file'
        };
    }
    
    // 检查是否为文件夹链接
    if (url.includes('/drive/folders/')) {
        return {
            isValid: false,
            type: 'folder',
            message: '这是文件夹链接，请使用具体文件的链接'
        };
    }
    
    // 检查是否为主页链接
    if (url.includes('/drive/home')) {
        return {
            isValid: false,
            type: 'home',
            message: '这是Google Drive主页链接，请使用具体文件的链接'
        };
    }
    
    return {
        isValid: false,
        type: 'unknown',
        message: 'Google Drive链接格式不正确'
    };
}

// 显示上传视频模态框
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'block';
        
        // 添加Google Drive链接帮助信息
        const helpText = document.getElementById('googleDriveHelp');
        if (helpText) {
            helpText.innerHTML = `
                <div style="background: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
                    <strong>💡 Google Drive链接使用说明：</strong><br>
                    1. 右键点击Google Drive中的视频文件<br>
                    2. 选择"获取链接"或"分享"<br>
                    3. 复制链接格式：https://drive.google.com/file/d/文件ID/view<br>
                    4. 确保文件已设置为"任何人都可以查看"<br>
                    5. 系统将使用iframe播放器播放Google Drive视频<br>
                    <em>❌ 不要使用主页链接或文件夹链接</em><br>
                    <em>⚠️ Google Drive视频使用嵌入式播放器，可能需要几秒钟加载</em>
                </div>
            `;
        }
    } else {
        showMessage('上传功能暂时不可用', 'error');
    }
}

// 显示登录模态框
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 显示注册模态框
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Firebase登录处理
async function handleFirebaseLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showMessage('正在登录...', 'info');
        
        const result = await FirebaseAuth.loginWithEmail(email, password);
        
        if (result.success) {
            showMessage('登录成功！', 'success');
            loadVideos(); // 加载视频列表
        } else {
            // 处理常见错误
            let errorMessage = '登录失败';
            if (result.error.includes('user-not-found')) {
                errorMessage = '用户不存在，请先注册';
            } else if (result.error.includes('wrong-password')) {
                errorMessage = '密码错误';
            } else if (result.error.includes('invalid-email')) {
                errorMessage = '邮箱格式不正确';
            } else if (result.error.includes('too-many-requests')) {
                errorMessage = '登录尝试次数过多，请稍后再试';
            }
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showMessage('登录失败，请稍后重试', 'error');
    }
}

// Google登录处理
async function handleGoogleLogin() {
    try {
        showMessage('正在使用Google登录...', 'info');
        
        const result = await FirebaseAuth.loginWithGoogle();
        
        if (result.success) {
            showMessage('Google登录成功！', 'success');
            loadVideos(); // 加载视频列表
        } else {
            showMessage('Google登录失败，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('Google登录失败:', error);
        showMessage('Google登录失败，请稍后重试', 'error');
    }
}

// 匿名登录处理
async function handleAnonymousLogin() {
    try {
        showMessage('正在创建匿名账户...', 'info');
        
        const result = await FirebaseAuth.loginAnonymously();
        
        if (result.success) {
            showMessage('匿名登录成功！', 'success');
            loadVideos(); // 加载视频列表
        } else {
            showMessage('匿名登录失败，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('匿名登录失败:', error);
        showMessage('匿名登录失败，请稍后重试', 'error');
    }
}

// Firebase注册处理
async function handleFirebaseRegister(event) {
    event.preventDefault();
    
    const displayName = document.getElementById('registerDisplayName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        showMessage('正在注册...', 'info');
        
        const result = await FirebaseAuth.registerWithEmail(email, password, displayName);
        
        if (result.success) {
            showMessage('注册成功！请检查邮箱验证', 'success');
            loadVideos(); // 加载视频列表
        } else {
            // 处理常见错误
            let errorMessage = '注册失败';
            if (result.error.includes('email-already-in-use')) {
                errorMessage = '该邮箱已被注册';
            } else if (result.error.includes('weak-password')) {
                errorMessage = '密码强度不够，请使用至少6位字符';
            } else if (result.error.includes('invalid-email')) {
                errorMessage = '邮箱格式不正确';
            }
            showMessage(errorMessage, 'error');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败，请稍后重试', 'error');
    }
}

// 忘记密码处理
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotPasswordEmail').value;
    
    try {
        showMessage('正在发送重置链接...', 'info');
        
        const result = await FirebaseAuth.resetPassword(email);
        
        if (result.success) {
            showMessage('密码重置链接已发送到您的邮箱', 'success');
            closeModal('forgotPasswordModal');
        } else {
            showMessage('发送失败，请检查邮箱地址', 'error');
        }
    } catch (error) {
        console.error('密码重置失败:', error);
        showMessage('密码重置失败，请稍后重试', 'error');
    }
}

// 显示忘记密码模态框
function showForgotPasswordModal() {
    closeModal('loginModal');
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Firebase退出登录
async function logout() {
    try {
        const result = await FirebaseAuth.logout();
        
        if (result.success) {
            showMessage('已成功登出', 'info');
            // 重新加载页面以清除所有状态
            window.location.reload();
        } else {
            showMessage('登出失败，请稍后重试', 'error');
        }
    } catch (error) {
        console.error('登出失败:', error);
        showMessage('登出失败，请稍后重试', 'error');
    }
}

// 测试视频链接
function testVideoLink(videoUrl) {
    document.getElementById('uploadVideoUrl').value = videoUrl;
    showMessage('已填入测试链接，请点击"上传视频"按钮测试', 'info');
}

// 处理本地文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        console.log('选择的文件:', file.name, file.size, file.type);
        
        // 显示文件名
        const fileNameDisplay = document.getElementById('selectedFileName');
        fileNameDisplay.textContent = `已选择: ${file.name} (${formatFileSize(file.size)})`;
        fileNameDisplay.style.display = 'block';
        
        // 清空URL输入框
        document.getElementById('uploadVideoUrl').value = '';
        
        showMessage(`已选择文件: ${file.name}`, 'info');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理视频上传
async function handleUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('uploadVideoTitle').value;
    const description = document.getElementById('uploadVideoDescription').value;
    const videoUrl = document.getElementById('uploadVideoUrl').value;
    const videoFile = document.getElementById('uploadVideoFile').files[0];
    
    if (!title) {
        showMessage('请输入视频标题', 'error');
        return;
    }
    
    if (!videoUrl && !videoFile) {
        showMessage('请选择视频文件或输入视频链接', 'error');
        return;
    }
    
    try {
        let processedUrl = '';
        let fileName = '';
        
        if (videoFile) {
            // 处理本地文件上传
            console.log('处理本地文件上传:', videoFile.name);
            
            // 检查文件大小（限制为100MB）
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (videoFile.size > maxSize) {
                showMessage('文件大小不能超过100MB', 'error');
                return;
            }
            
            // 创建本地文件URL
            processedUrl = URL.createObjectURL(videoFile);
            fileName = videoFile.name;
            
            showMessage('本地文件已处理，注意：刷新页面后文件会丢失', 'warning');
        } else if (videoUrl) {
            // 处理在线视频链接
            processedUrl = videoUrl;
            fileName = 'external-video.mp4';
            
            // 处理不同类型的视频链接
            if (videoUrl.includes('drive.google.com')) {
                const driveValidation = validateGoogleDriveLink(videoUrl);
                
                if (driveValidation.isValid) {
                    console.log('检测到有效的Google Drive文件链接:', videoUrl);
                    showMessage('Google Drive文件链接已识别，将尝试优化播放', 'info');
                } else {
                    console.log('检测到无效的Google Drive链接:', videoUrl, driveValidation.message);
                    showMessage(driveValidation.message, 'error');
                    return; // 阻止上传无效链接
                }
            } else if (videoUrl.includes('dropbox.com')) {
                // Dropbox链接处理
                if (videoUrl.includes('?dl=0')) {
                    // 将dl=0改为dl=1以支持直接下载
                    processedUrl = videoUrl.replace('?dl=0', '?dl=1');
                    console.log('处理Dropbox链接:', videoUrl, '->', processedUrl);
                } else if (!videoUrl.includes('?dl=')) {
                    // 如果没有dl参数，添加dl=1
                    processedUrl = videoUrl + '?dl=1';
                    console.log('处理Dropbox链接:', videoUrl, '->', processedUrl);
                }
            } else if (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg')) {
                // 直接视频文件链接
                console.log('使用直接视频链接:', videoUrl);
            } else {
                console.log('使用其他类型链接:', videoUrl);
            }
        }
        
        const newVideo = {
            id: Date.now(),
            title: title,
            description: description || '',
            filename: fileName,
            filepath: processedUrl,
            videoUrl: processedUrl,
            thumbnail_path: null,
            duration: 0,
            file_size: videoFile ? videoFile.size : 0,
            uploaded_by: currentUser ? currentUser.id : 1755168092284,
            uploader_name: currentUser ? currentUser.username : "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // 先添加到本地数组
        videos.push(newVideo);
        displayVideos(videos);
        
        // 尝试保存到云数据库
        const saveSuccess = await saveToCloudDatabase();
        
        if (saveSuccess) {
            showMessage('视频上传成功！其他设备也能看到这个视频', 'success');
        } else {
            showMessage('视频已添加，但云数据库保存失败。请配置JSONBin.io设置。', 'warning');
        }
        
        closeModal('uploadModal');
        document.getElementById('uploadForm').reset();
        document.getElementById('selectedFileName').style.display = 'none';
        
    } catch (error) {
        console.error('上传失败:', error);
        showMessage('上传失败，请稍后重试', 'error');
    }
}

// 删除视频
async function deleteVideo(videoId) {
    // 检查是否为管理员
    if (!currentUser || !(currentUser.is_admin || currentUser.isAdmin)) {
        showMessage('只有管理员才能删除视频', 'error');
        return;
    }
    
    if (!confirm('确定要删除这个视频吗？')) {
        return;
    }
    
    try {
        // 从本地列表中删除
        videos = videos.filter(v => v.id != videoId);
        
        // 保存到云数据库
        const saveSuccess = await saveToCloudDatabase();
        
        if (saveSuccess) {
            showMessage('视频删除成功', 'success');
        } else {
            showMessage('视频已删除，但保存到云数据库失败', 'warning');
        }
        
        // 重新显示视频列表
        displayVideos(videos);
        
    } catch (error) {
        console.error('删除视频失败:', error);
        showMessage('删除失败，请稍后重试', 'error');
    }
}

// 显示个人资料模态框
function showProfileModal() {
    showMessage('个人资料功能开发中', 'info');
}

// 显示播放历史模态框
function showHistoryModal() {
    showMessage('播放历史功能开发中', 'info');
}

// 创建模态框
function createModal(id, title, content) {
    const modalContainer = document.getElementById('modalContainer');
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <span class="close" onclick="closeModal('${id}')">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(id);
        }
    });
    
    return modal;
}

// 关闭模态框
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
}

// 格式化时长
function formatDuration(seconds) {
    if (!seconds) return '未知';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 显示视频列表
function showVideos() {
    showPage('videos');
}

