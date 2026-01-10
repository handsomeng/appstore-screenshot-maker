# Components - UI 组件模块

> [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## 职责

React UI 组件，分为 canvas、controls、layout、ui 四个子目录。

## 子目录

- `canvas/` - 画布渲染组件 (KonvaCanvas, CanvasSwitcher, ResizeHandles)
- `controls/` - 控制面板组件 (BackgroundEditor, TextEditor, ExportPanel)
- `layout/` - 布局组件 (Sidebar, CanvasArea, PropertiesPanel)
- `ui/` - 通用 UI 组件 (Toast, SyncConfirmation)

## 关键组件

- `KonvaCanvas.jsx` - 主画布，渲染背景、截图、文字
- `CanvasSwitcher.jsx` - 画布切换器 (待创建)
- `SyncConfirmation.jsx` - 同步确认弹窗 (待创建)
