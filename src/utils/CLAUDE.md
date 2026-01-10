# Utils - 工具函数模块

> [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## 职责

纯函数工具，无副作用，可独立测试。

## 文件

- `deviceFrames.js` - 设备框架配置
- `exportUtils.js` - 导出功能
- `fileValidation.js` - 文件验证
- `presets.js` - 预设配置
- `textUtils.js` - 文字处理
- `syncManager.js` - 同步管理器 (待创建)

## syncManager 核心函数

```javascript
shouldTriggerSync(canvasIndex, batchMode, rememberChoice)
syncToSlaves(property, value, canvases)
generatePlaceholderText(text, placeholder = '哈')
```
