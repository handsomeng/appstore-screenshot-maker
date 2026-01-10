# Stores - 状态管理模块

> [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## 职责

Zustand 状态管理，管理多画布状态、同步设置、导出配置。

## 文件

- `canvasStore.js` - 核心状态：多画布、背景、文字、截图、同步设置

## 数据结构

### CanvasState (单个画布状态)

```javascript
{
  id: string,
  index: number,           // 0 = Master, 1-5 = Slave
  screenshot: { imageData, position, scale } | null,
  background: { type, color, gradient },
  textLayers: [{ id, text, position, fontFamily, fontSize, color, align }],
  canvasSize: { width, height }
}
```

### SyncSettings (同步设置)

```javascript
{
  batchMode: boolean,
  rememberChoice: {
    background: 'sync' | 'no-sync' | null,
    textStyle: 'sync' | 'no-sync' | null,
    textContent: 'sync' | 'no-sync' | null,
    position: 'sync' | 'no-sync' | null,
    canvasSize: 'sync' | 'no-sync' | null
  }
}
```

## 关键约束

- 最多 6 个画布
- 位置使用 0-1 百分比
- 最小画布尺寸 200x200
