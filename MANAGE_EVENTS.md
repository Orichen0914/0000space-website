# Event Management Guide

## 如何更新活动信息

### 快速开始
1. 打开 `events.json` 文件
2. 修改或添加活动信息
3. 保存文件
4. 刷新网页查看更新

### events.json 文件结构

```json
{
  "events": [
    {
      "id": 1,                              // 唯一ID
      "title": "KPOP x HIPHOP NIGHT",       // 活动标题
      "image": "images/events/event1.jpg",  // 图片路径
      "date": "2025-08-15",                 // 日期 (YYYY-MM-DD)
      "time": "11:00PM-4:00AM",             // 时间
      "venue": "5K EVENT",                  // 地点
      "visible": true,                      // 是否显示
      "featured": false                     // 是否为特色活动
    }
  ]
}
```

### 添加新活动

1. **上传图片**
   - 将活动海报图片放入 `images/events/` 文件夹
   - 建议图片比例: 4:5 (竖版)
   - 推荐尺寸: 至少 800x1000px
   - 支持格式: JPG, PNG

2. **编辑 events.json**
   在 events 数组中添加新对象:
   ```json
   {
     "id": 5,
     "title": "新活动名称",
     "image": "images/events/event5.jpg",
     "date": "2025-09-20",
     "time": "10:00PM",
     "venue": "活动地点",
     "visible": true,
     "featured": false
   }
   ```

### 隐藏活动
将 `visible` 设置为 `false`:
```json
"visible": false
```

### 删除活动
直接从 events.json 中删除该活动对象

### 修改活动顺序
活动会自动按日期排序（最近的在前）

### 特色活动
将 `featured` 设置为 `true` 可以标记为特色活动（可用于未来的样式定制）

## 注意事项

- ⚠️ 确保 JSON 格式正确（逗号、引号等）
- ⚠️ 图片路径必须正确
- ⚠️ 日期格式必须是 YYYY-MM-DD
- ⚠️ ID 必须唯一

## 常见问题

**Q: 修改后网页没有更新？**
A: 清除浏览器缓存 (Ctrl+F5 或 Cmd+Shift+R)

**Q: 图片不显示？**
A: 检查图片路径是否正确，文件名大小写是否匹配

**Q: 网页显示错误？**
A: 检查 events.json 格式是否正确，可以使用 JSON 验证工具

## 备份建议

定期备份 events.json 文件和 images/events 文件夹