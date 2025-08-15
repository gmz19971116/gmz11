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
    console.log('更新UI为已登录状态:', currentUser);
    
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username;
    
    // 检查管理员权限（支持两种字段名）
    const isAdmin = currentUser.is_admin || currentUser.isAdmin;
    console.log('用户权限检查 - is_admin:', currentUser.is_admin, 'isAdmin:', currentUser.isAdmin, '最终结果:', isAdmin);
    
    // 只有管理员才能看到上传按钮
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
    
    // 隐藏管理员菜单
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
        const response = await fetch('/api/videos');
        
        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('服务器返回非JSON响应:', await response.text());
            showMessage('加载视频列表失败', 'error');
            return;
        }
        
        const data = await response.json();
        console.log('视频列表数据:', data);
        
        if (response.ok && data.success) {
            videos = data.videos || [];
            console.log('设置视频列表:', videos);
            displayVideos(videos);
        } else {
            console.error('加载视频列表失败:', data.error);
            showMessage(data.error || '加载视频列表失败', 'error');
        }
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
    
    // 检查是否为管理员
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
    
    // 添加点击事件监听器
    card.addEventListener('click', function(e) {
        // 如果点击的是删除按钮，不触发播放
        if (e.target.closest('.video-actions')) {
            return;
        }
        console.log('视频卡片被点击，播放视频:', video.id);
        playVideo(video.id);
    });
    
    return card;
}

// 测试播放视频
function testPlayVideo() {
    console.log('测试播放视频功能');
    if (videos && videos.length > 0) {
        console.log('播放第一个视频:', videos[0].id);
        playVideo(videos[0].id);
    } else {
        console.log('没有视频可播放');
        showMessage('没有视频可播放', 'error');
    }
}

// 播放视频
async function playVideo(videoId) {
    console.log('尝试播放视频:', videoId);
    
    try {
        const response = await fetch(`/api/videos/${videoId}`);
        console.log('视频详情响应状态:', response.status);
        
        // 检查响应类型
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error('服务器返回非JSON响应:', responseText);
            showMessage('服务器配置错误，请稍后重试', 'error');
            return;
        }
        
        const data = await response.json();
        console.log('视频详情数据:', data);
        
        if (response.ok && data.success) {
            console.log('切换到播放页面');
            showPage('player');
            
            // 更新视频信息
            const videoTitle = document.getElementById('videoTitle');
            const videoDescription = document.getElementById('videoDescription');
            const videoUploader = document.getElementById('videoUploader');
            const videoDuration = document.getElementById('videoDuration');
            const videoDate = document.getElementById('videoDate');
            
            if (videoTitle) videoTitle.textContent = data.video.title;
            if (videoDescription) videoDescription.textContent = data.video.description || '暂无描述';
            if (videoUploader) videoUploader.textContent = `上传者: ${data.video.uploader_name || '未知用户'}`;
            if (videoDuration) videoDuration.textContent = `时长: ${formatDuration(data.video.duration)}`;
            if (videoDate) videoDate.textContent = `上传时间: ${formatDate(data.video.created_at)}`;
            
            // 设置视频源
            const videoPlayer = document.getElementById('videoPlayer');
            const videoSource = document.getElementById('videoSource');
            
            if (videoPlayer && videoSource) {
                // 在Vercel环境中，始终使用在线示例视频
                const sampleVideos = [
                    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                ];
                
                // 根据视频ID选择不同的示例视频
                const videoIndex = videoId % sampleVideos.length;
                videoSource.src = sampleVideos[videoIndex];
                
                videoPlayer.load();
                console.log('视频源已设置:', videoSource.src);
                
                // 尝试自动播放
                videoPlayer.play().catch(error => {
                    console.log('自动播放失败，需要用户手动点击播放:', error);
                });
                
                if (data.playHistory && data.playHistory.last_position > 0) {
                    videoPlayer.currentTime = data.playHistory.last_position;
                }
            } else {
                console.error('未找到视频播放器元素');
            }
        } else {
            console.error('获取视频信息失败:', data.error);
            showMessage(data.error || '获取视频信息失败', 'error');
        }
    } catch (error) {
        console.error('播放视频失败:', error);
        showMessage('播放视频失败，请稍后重试', 'error');
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
    const file = document.getElementById('uploadVideoFile').files[0];
    
    if (!title) {
        showMessage('请输入视频标题', 'error');
        return;
    }
    
    if (!file) {
        showMessage('请选择视频文件', 'error');
        return;
    }
    
    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showMessage(`视频文件大小不能超过10MB（当前: ${(file.size / 1024 / 1024).toFixed(1)}MB）`, 'error');
        return;
    }
    
    try {
        // 在Vercel环境中，只上传视频元数据
        const response = await fetch('/api/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                filename: file.name,
                fileSize: file.size
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            showMessage('视频上传成功', 'success');
            closeModal('uploadModal');
            
            // 清空表单
            document.getElementById('uploadForm').reset();
            
            // 重新加载视频列表
            loadVideos();
        } else {
            const data = await response.json();
            showMessage(data.error || '上传失败', 'error');
        }
    } catch (error) {
        console.error('上传失败:', error);
        showMessage('上传功能暂时不可用，请稍后重试', 'error');
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
        console.log('尝试删除视频:', videoId);
        const response = await fetch(`/api/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('删除响应状态:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('删除成功:', data);
            showMessage('视频删除成功', 'success');
            loadVideos(); // 重新加载视频列表
        } else {
            const data = await response.json();
            console.log('删除失败:', data);
            showMessage(data.error || '删除失败', 'error');
        }
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
