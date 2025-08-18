// Firebase配置和认证功能
// 你的Firebase项目配置

// Firebase配置
const firebaseConfig = {
    apiKey: "AIzaSyA1fYg3CYGUI1ufiVsqFwTn675LA01Itec",
    authDomain: "zhuce-and-denglu-c71ca.firebaseapp.com",
    projectId: "zhuce-and-denglu-c71ca",
    storageBucket: "zhuce-and-denglu-c71ca.firebasestorage.app",
    messagingSenderId: "41297412217",
    appId: "1:41297412217:web:8b250fa2230edce367d4a8",
    measurementId: "G-VPL2RTVYF5"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);

// 获取认证实例
const auth = firebase.auth();

// 认证状态监听
auth.onAuthStateChanged((user) => {
    if (user) {
        // 用户已登录
        console.log('用户已登录:', user.email);
        handleUserLogin(user);
        
        // 同步更新script.js中的用户状态
        if (typeof checkAuthStatus === 'function') {
            setTimeout(() => {
                checkAuthStatus();
            }, 100);
        }
    } else {
        // 用户已登出
        console.log('用户已登出');
        handleUserLogout();
        
        // 同步更新script.js中的用户状态
        if (typeof checkAuthStatus === 'function') {
            setTimeout(() => {
                checkAuthStatus();
            }, 100);
        }
    }
});

// 处理用户登录
function handleUserLogin(user) {
    // 更新UI显示用户信息
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const adminMenu = document.getElementById('adminMenu');
    const username = document.getElementById('username');
    
    if (userMenu && authButtons) {
        userMenu.style.display = 'flex';
        authButtons.style.display = 'none';
        
        if (username) {
            username.textContent = user.displayName || user.email;
        }
        
        // 检查是否为管理员（只有特定邮箱拥有管理员权限）
        if (user.email === '1348155504@qq.com') {
            if (adminMenu) {
                adminMenu.style.display = 'flex';
            }
        }
    }
    
    // 保存用户信息到本地存储
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        is_admin: user.email === '1348155504@qq.com'
    }));
    
    // 关闭登录模态框
    closeModal('loginModal');
    closeModal('registerModal');
    
    showMessage(`欢迎回来，${user.displayName || user.email}！`, 'success');
}

// 处理用户登出
function handleUserLogout() {
    // 更新UI显示登录按钮
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const adminMenu = document.getElementById('adminMenu');
    
    if (userMenu && authButtons) {
        userMenu.style.display = 'none';
        authButtons.style.display = 'flex';
        
        if (adminMenu) {
            adminMenu.style.display = 'none';
        }
    }
    
    // 清除本地存储的用户信息
    localStorage.removeItem('currentUser');
    
    showMessage('已成功登出', 'info');
}

// Firebase认证功能
const FirebaseAuth = {
    // 邮箱密码注册
    async registerWithEmail(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 更新用户显示名称
            if (displayName) {
                await user.updateProfile({
                    displayName: displayName
                });
            }
            
            return { success: true, user: user };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 邮箱密码登录
    async loginWithEmail(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Google登录
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google登录失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 匿名登录
    async loginAnonymously() {
        try {
            const userCredential = await auth.signInAnonymously();
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('匿名登录失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 登出
    async logout() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('登出失败:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 获取当前用户
    getCurrentUser() {
        return auth.currentUser;
    },
    
    // 重置密码
    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('密码重置失败:', error);
            return { success: false, error: error.message };
        }
    }
};

// 导出Firebase认证功能
window.FirebaseAuth = FirebaseAuth;
