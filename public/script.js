// 全局变量
let currentUser = null;
let videos = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
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
        // 在Vercel环境中，直接检查是否有用户数据
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
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username;
    
    if (currentUser.isAdmin) {
        document.getElementById('adminMenu').style.display = 'block';
    }
}

// 更新UI为未登录状态
function updateUIForLoggedOutUser() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('adminMenu').style.display = 'none';
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
        const response = await fetch('/api/videos');
        const data = await response.json();
        
        videos = data.videos;
        displayVideos(videos);
    } catch (error) {
        console.error('加载视频列表失败:', error);
        showMessage('加载视频列表失败', 'error');
    }
}

// 显示视频列表
function displayVideos(videoList) {
    const videosGrid = document.getElementById('videosGrid');
    videosGrid.innerHTML = '';
    
    if (videoList.length === 0) {
        videosGrid.innerHTML = '<p class="no-videos">暂无视频</p>';
        return;
    }
    
    videoList.forEach(video => {
        const videoCard = createVideoCard(video);
        videosGrid.appendChild(videoCard);
    });
}

// 创建视频卡片
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.onclick = () => playVideo(video.id);
    
    const duration = formatDuration(video.duration);
    const uploadDate = formatDate(video.created_at);
    
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
        </div>
    `;
    
    return card;
}

// 播放视频
async function playVideo(videoId) {
    try {
        const response = await fetch(`/api/videos/${videoId}`);
        const data = await response.json();
        
        if (response.ok) {
            showPage('player');
            
            document.getElementById('videoTitle').textContent = data.video.title;
            document.getElementById('videoDescription').textContent = data.video.description || '暂无描述';
            document.getElementById('videoUploader').textContent = `上传者: ${data.video.uploader_name || '未知用户'}`;
            document.getElementById('videoDuration').textContent = `时长: ${formatDuration(data.video.duration)}`;
            document.getElementById('videoDate').textContent = `上传时间: ${formatDate(data.video.created_at)}`;
            
            const videoPlayer = document.getElementById('videoPlayer');
            const videoSource = document.getElementById('videoSource');
            videoSource.src = `/${data.video.filepath}`;
            videoPlayer.load();
            
            if (data.playHistory && data.playHistory.last_position > 0) {
                videoPlayer.currentTime = data.playHistory.last_position;
            }
        } else {
            showMessage(data.error || '获取视频信息失败', 'error');
        }
    } catch (error) {
        console.error('播放视频失败:', error);
        showMessage('播放视频失败', 'error');
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

// 显示登录模态框
function showLoginModal() {
    const modal = createModal('loginModal', '用户登录', `
        <form id="loginForm">
            <div class="form-group">
                <label for="loginUsername">用户名或邮箱</label>
                <input type="text" id="loginUsername" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">密码</label>
                <input type="password" id="loginPassword" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="rememberMe">
                    <span>记住我</span>
                </label>
            </div>
            <button type="submit" class="btn btn-primary btn-block">登录</button>
        </form>
    `);
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// 显示注册模态框
function showRegisterModal() {
    const modal = createModal('registerModal', '用户注册', `
        <form id="registerForm">
            <div class="form-group">
                <label for="registerUsername">用户名</label>
                <input type="text" id="registerUsername" required>
            </div>
            <div class="form-group">
                <label for="registerEmail">邮箱</label>
                <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
                <label for="registerPassword">密码</label>
                <input type="password" id="registerPassword" required minlength="8">
            </div>
            <div class="form-group">
                <label for="confirmPassword">确认密码</label>
                <input type="password" id="confirmPassword" required minlength="8">
            </div>
            <button type="submit" class="btn btn-primary btn-block">注册</button>
        </form>
    `);
    
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                rememberMe: rememberMe
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
        
        if (response.ok) {
            showMessage('登录成功', 'success');
            closeModal('loginModal');
            
            // 直接设置用户状态
            if (data.user) {
                currentUser = data.user;
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
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
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
            method: 'POST'
        });
        
        if (response.ok) {
            showMessage('已退出登录', 'info');
            updateUIForLoggedOutUser();
        } else {
            showMessage('退出登录失败', 'error');
        }
    } catch (error) {
        console.error('退出登录失败:', error);
        showMessage('退出登录失败', 'error');
    }
}

// 显示上传模态框
function showUploadModal() {
    const modal = createModal('uploadModal', '上传视频', `
        <form id="uploadForm">
            <div class="form-group">
                <label for="uploadVideoTitle">视频标题</label>
                <input type="text" id="uploadVideoTitle" required>
            </div>
            <div class="form-group">
                <label for="uploadVideoDescription">视频描述</label>
                <textarea id="uploadVideoDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="uploadVideoFile">选择视频文件</label>
                <input type="file" id="uploadVideoFile" accept="video/*" required>
                <div class="file-info" id="uploadFileInfo"></div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">上传视频</button>
        </form>
    `);
    
    document.getElementById('uploadVideoFile').addEventListener('change', handleFileSelect);
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
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
    
    const formData = new FormData();
    const title = document.getElementById('uploadVideoTitle').value;
    const description = document.getElementById('uploadVideoDescription').value;
    const file = document.getElementById('uploadVideoFile').files[0];
    
    if (!file) {
        showMessage('请选择视频文件', 'error');
        return;
    }
    
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', file);
    
    try {
        const response = await fetch('/api/videos/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('视频上传成功', 'success');
            closeModal('uploadModal');
            loadVideos();
        } else {
            showMessage(data.error || '视频上传失败', 'error');
        }
    } catch (error) {
        console.error('视频上传失败:', error);
        showMessage('视频上传失败，请稍后重试', 'error');
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
        modal.remove();
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
