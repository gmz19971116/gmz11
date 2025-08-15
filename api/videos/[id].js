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
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const videoId = req.query.id || req.url.split('/').pop();
  
  if (req.method === 'GET') {
    // 获取视频详情
    const video = memoryDB.videos.find(v => v.id == videoId);
    
    if (!video) {
      return res.status(404).json({ error: '视频不存在' });
    }
    
    res.status(200).json({
      success: true,
      video: video,
      playHistory: null
    });
    
  } else if (req.method === 'DELETE') {
    // 删除视频（简化版本，不验证会话）
    const videoIndex = memoryDB.videos.findIndex(v => v.id == videoId);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: '视频不存在' });
    }
    
    // 删除视频
    memoryDB.videos.splice(videoIndex, 1);
    
    res.status(200).json({
      success: true,
      message: '视频删除成功'
    });
    
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
};
