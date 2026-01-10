# App Store Screenshot Maker - 项目宪法

> [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## 项目概述

App Store 截图制作工具，支持多画布模板同步系统。用户可上传截图、添加文字、设置背景，批量生成 App Store 风格的宣传图。

## 技术栈

- **框架**: React 18 + Vite
- **状态管理**: Zustand
- **画布渲染**: Konva / react-konva
- **样式**: Tailwind CSS
- **测试**: Vitest + fast-check (属性测试)

## 核心架构

```
src/
├── components/     # UI 组件 (见 components/CLAUDE.md)
├── stores/         # Zustand 状态管理 (见 stores/CLAUDE.md)
├── utils/          # 工具函数 (见 utils/CLAUDE.md)
├── App.jsx         # 应用入口
└── main.jsx        # React 挂载点
```

## 核心概念

### 多画布模板系统 (Multi-Canvas Template)

- **Master Canvas**: 第一张画布，修改时可同步到其他画布
- **Slave Canvas**: 第 2-6 张画布，修改不影响其他画布
- **Sync Confirmation**: 同步确认弹窗，Master 修改时询问是否同步
- **Batch Mode**: 批量模式，自动同步无需确认

### 位置系统

所有位置使用相对坐标 (0-1 百分比)，确保不同尺寸画布间同步正确。

## 编码规范

- 文件最大 800 行
- 文件夹最多 8 个文件
- 中文注释和文档
- 遵循 Linus Torvalds 哲学：简洁、消除特殊情况、好品味

## 关键文件

- `stores/canvasStore.js` - 核心状态管理
- `components/canvas/KonvaCanvas.jsx` - 画布渲染
- `utils/syncManager.js` - 同步逻辑 (待创建)

## 测试

```bash
npm test          # 运行所有测试
npm run dev       # 开发服务器 (localhost:5173)
```
