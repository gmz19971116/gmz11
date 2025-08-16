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

// 检查认证状态
async function checkAuthStatus() {
    try {
        if (currentUser) {
            updateUIForLoggedInUser();
            loadVideos();
            return;
        }
        
        const response = await fetch('/api/auth/status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
                currentUser = data.user;
                updateUIForLoggedInUser();
                loadVideos();
            } else {
                updateUIForLoggedOutUser();
            }
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('检查认证状态失败:', error);
        updateUIForLoggedOutUser();
    }
}

// 更新UI为已登录状态
function updateUIForLoggedInUser() {
    console.log('更新UI为已登录状态:', currentUser);
    
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username;
    
    const isAdmin = currentUser.is_admin || currentUser.isAdmin;
    console.log('用户权限检查 - is_admin:', currentUser.is_admin, 'isAdmin:', currentUser.isAdmin, '最终结果:', isAdmin);
    
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) {
        console.log('找到adminMenu元素，用户isAdmin:', isAdmin);
        if (isAdmin) {
            adminMenu.style.display = 'block';
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
                console.log('使用外部视频URL:', videoSrc);
                
                // 处理OneDrive链接 - 确保使用直接下载链接
                if (videoSrc.includes('1drv.ms') || videoSrc.includes('onedrive.live.com')) {
                    // 如果已经是处理过的链接，直接使用
                    if (videoSrc.includes('download.aspx')) {
                        console.log('使用已处理的OneDrive下载链接:', videoSrc);
                    } else {
                        // 需要重新处理链接
                        let baseUrl = videoSrc.split('?')[0];
                        
                        if (baseUrl.includes('1drv.ms')) {
                            const match = baseUrl.match(/\/v\/([^\/]+)/);
                            if (match) {
                                const fileId = match[1];
                                videoSrc = `https://onedrive.live.com/download.aspx?cid=${fileId}`;
                            }
                        } else if (baseUrl.includes('onedrive.live.com')) {
                            if (baseUrl.includes('/redir?')) {
                                videoSrc = baseUrl + '&download=1';
                            } else if (baseUrl.includes('/embed/')) {
                                videoSrc = baseUrl.replace('/embed/', '/redir?') + '&download=1';
                            } else if (baseUrl.includes('/viewid=')) {
                                const viewMatch = baseUrl.match(/\/viewid=([^\/]+)/);
                                if (viewMatch) {
                                    const viewId = viewMatch[1];
                                    videoSrc = `https://onedrive.live.com/download.aspx?viewid=${viewId}`;
                                }
                            } else {
                                videoSrc = baseUrl + '?download=1';
                            }
                        }
                        
                        console.log('重新处理OneDrive链接:', videoSrc);
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
                showMessage('视频加载失败，请检查链接或稍后重试', 'error');
            };
            
            videoPlayer.onloadstart = function() {
                console.log('开始加载视频');
            };
            
            videoPlayer.oncanplay = function() {
                console.log('视频可以播放');
            };
            
            // 延迟自动播放，避免被中断
            setTimeout(() => {
                const playPromise = videoPlayer.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('自动播放成功');
                    }).catch(error => {
                        console.log('自动播放失败，需要用户手动点击播放:', error);
                        showMessage('请点击播放按钮开始播放', 'info');
                    });
                }
            }, 1000);
            
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

// 显示上传视频模态框
function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'block';
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

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
            credentials: 'include'
        });
        
        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('服务器返回非JSON响应:', await response.text());
            showMessage('服务器配置错误，请稍后重试', 'error');
            return;
        }
        
        const data = await response.json();
        console.log('登录响应数据:', data);
        
        if (response.ok) {
            showMessage('登录成功', 'success');
            closeModal('loginModal');
            
            // 直接设置用户状态
            if (data.user) {
                currentUser = data.user;
                console.log('设置当前用户:', currentUser);
                updateUIForLoggedInUser();
                loadVideos(); // 加载视频列表
            }
        } else {
            showMessage(data.error || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showMessage('登录失败，请稍后重试', 'error');
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('注册成功', 'success');
            closeModal('registerModal');
            checkAuthStatus();
        } else {
            showMessage(data.error || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败，请稍后重试', 'error');
    }
}

// 退出登录
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            currentUser = null;
            updateUIForLoggedOutUser();
            showMessage('退出登录成功', 'success');
        } else {
            // 即使API失败，也清除本地状态
            currentUser = null;
            updateUIForLoggedOutUser();
            showMessage('退出登录成功', 'success');
        }
    } catch (error) {
        console.error('退出登录失败:', error);
        // 即使出错，也清除本地状态
        currentUser = null;
        updateUIForLoggedOutUser();
        showMessage('退出登录成功', 'success');
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    const fileInfo = document.getElementById('uploadFileInfo');
    
    if (file) {
        const size = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.textContent = `文件名: ${file.name}, 大小: ${size} MB`;
    } else {
        fileInfo.textContent = '';
    }
}

// 处理视频上传
async function handleUpload(e) {
    e.preventDefault();
    
    const title = document.getElementById('uploadVideoTitle').value;
    const description = document.getElementById('uploadVideoDescription').value;
    const videoUrl = document.getElementById('uploadVideoUrl').value;
    
    if (!title) {
        showMessage('请输入视频标题', 'error');
        return;
    }
    
    if (!videoUrl) {
        showMessage('请输入视频链接', 'error');
        return;
    }
    
    try {
        let processedUrl = videoUrl;
        
        // 处理OneDrive链接 - 转换为直接下载链接
        if (videoUrl.includes('1drv.ms') || videoUrl.includes('onedrive.live.com')) {
            console.log('原始OneDrive链接:', videoUrl);
            
            // 处理1drv.ms链接
            if (videoUrl.includes('1drv.ms')) {
                // 从1drv.ms链接中提取完整的文件ID
                const match = videoUrl.match(/\/v\/([^\/\?]+)/);
                if (match) {
                    const fileId = match[1];
                    console.log('提取的文件ID:', fileId);
                    // 使用完整的文件ID创建下载链接
                    processedUrl = `https://onedrive.live.com/download.aspx?cid=${fileId}`;
                } else {
                    console.error('无法从1drv.ms链接中提取文件ID');
                    showMessage('OneDrive链接格式不正确，请检查链接', 'error');
                    return;
                }
            } else if (videoUrl.includes('onedrive.live.com')) {
                // 处理onedrive.live.com链接
                let baseUrl = videoUrl.split('?')[0];
                
                if (baseUrl.includes('/redir?')) {
                    // 已经是重定向链接，添加下载参数
                    processedUrl = videoUrl + '&download=1';
                } else if (baseUrl.includes('/embed/')) {
                    // 嵌入链接，转换为下载链接
                    processedUrl = baseUrl.replace('/embed/', '/redir?') + '&download=1';
                } else if (baseUrl.includes('/viewid=')) {
                    // 查看链接，转换为下载链接
                    const viewMatch = videoUrl.match(/viewid=([^&]+)/);
                    if (viewMatch) {
                        const viewId = viewMatch[1];
                        processedUrl = `https://onedrive.live.com/download.aspx?viewid=${viewId}`;
                    }
                } else {
                    // 其他格式，尝试添加下载参数
                    processedUrl = videoUrl + '?download=1';
                }
            }
            
            console.log('处理OneDrive链接:', videoUrl, '->', processedUrl);
        }
        
        const newVideo = {
            id: Date.now(),
            title: title,
            description: description || '',
            filename: 'onedrive-video.mp4',
            filepath: processedUrl,
            videoUrl: processedUrl,
            thumbnail_path: null,
            duration: 0,
            file_size: 0,
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

