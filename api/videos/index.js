// 内存数据库（用于Vercel）
const memoryDB = {
  videos: [
    {
      id: 1755169872969,
      title: "yu",
      description: "123",
      filename: "VID_20250801_123814.mp4",
      filepath: "uploads/video-1755169872314-936489181.mp4",
      thumbnail_path: null,
      duration: 0,
      file_size: 105331857,
      uploaded_by: 1755168092284,
      uploader_name: "admin",
      created_at: "2025-08-14T11:11:12.969Z",
      updated_at: "2025-08-14T11:11:12.969Z"
    }
  ]
};

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    // 获取视频列表
    res.status(200).json({
      success: true,
      videos: memoryDB.videos
    });
    
  } else if (req.method === 'POST') {
    // 上传视频（简化版本，不实际处理文件）
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: '视频标题不能为空' });
    }
    
    const newVideo = {
      id: Date.now(),
      title: title,
      description: description || '',
      filename: 'sample-video.mp4',
      filepath: 'uploads/sample-video.mp4',
      thumbnail_path: null,
      duration: 0,
      file_size: 0,
      uploaded_by: 1755168092284,
      uploader_name: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    memoryDB.videos.push(newVideo);
    
    res.status(201).json({
      success: true,
      video: newVideo,
      message: '视频上传成功'
    });
    
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
};
