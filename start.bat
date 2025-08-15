@echo off
echo 正在启动视频播放平台...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo 启动服务器...
echo 访问地址: http://localhost:3000
echo 默认管理员账户: admin / admin123
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm start

pause


