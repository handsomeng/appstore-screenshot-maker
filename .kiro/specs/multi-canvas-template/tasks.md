# Implementation Plan: Multi-Canvas Template System

## Overview

实现多画布模板同步系统，支持最多 6 张画布，通过第一张画布（Master）建立模板，后续画布可选择性同步修改。使用 React + Zustand + Konva 技术栈。

## Tasks

- [x] 1. 重构 Store 支持多画布状态
  - [x] 1.1 扩展 canvasStore 数据结构
    - 将单画布状态改为画布数组 `canvases: CanvasState[]`
    - 添加 `activeCanvasIndex` 跟踪当前编辑画布
    - 添加 `syncSettings` 存储同步配置
    - _Requirements: 1.1, 1.2, 7.1_
  - [x] 1.2 实现多画布 CRUD 操作
    - `addCanvas(screenshot)`: 添加新画布，最多 6 个
    - `removeCanvas(index)`: 删除画布并重新索引
    - `setActiveCanvas(index)`: 切换当前画布
    - `updateCanvas(index, updates)`: 更新指定画布
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 1.3 编写 Property 1 测试 - 画布数量上限
    - **Property 1: Maximum Canvas Count Constraint**
    - **Validates: Requirements 1.4**

- [x] 2. 实现画布切换器组件 (Canvas Switcher)
  - [x] 2.1 创建 CanvasSwitcher 组件
    - 底部水平排列的缩略图卡片
    - 点击切换当前编辑画布
    - Master 画布显示 "模板" 标签
    - _Requirements: 1.1, 1.2, 1.6_
  - [x] 2.2 实现缩略图实时预览
    - 使用 Canvas 生成简化缩略图
    - 画布变化时更新缩略图
    - _Requirements: 1.1_
  - [x] 2.3 实现画布删除功能
    - 悬停显示删除按钮
    - 删除后重新索引
    - 至少保留 1 个画布
    - _Requirements: 1.5_

- [x] 3. 实现画布尺寸自由调整
  - [x] 3.1 创建 ResizeHandles 组件
    - 8 个拖拽点（四角 + 四边中点）
    - 拖拽时实时更新尺寸
    - 显示当前尺寸数值
    - _Requirements: 2.1, 2.2, 2.4_
  - [x] 3.2 实现尺寸约束逻辑
    - 最小尺寸 200x200 像素
    - 拖拽范围限制
    - _Requirements: 2.3_
  - [x] 3.3 编写 Property 2 测试 - 最小尺寸约束
    - **Property 2: Minimum Canvas Size Constraint**
    - **Validates: Requirements 2.3**
  - [x] 3.4 移除原有的 CanvasSizeSelector 预设选择器
    - 使用自由拖拽替代预设下拉框
    - _Requirements: 2.1_

- [x] 4. 实现同步确认组件 (Sync Confirmation)
  - [x] 4.1 创建 SyncConfirmation 组件
    - Toast 样式弹窗
    - 显示同步提示信息
    - 确认/取消按钮
    - "记住选择" 复选框
    - _Requirements: 6.1, 3.5_
  - [x] 4.2 实现自动消失逻辑
    - 5 秒后自动消失
    - 默认不同步
    - _Requirements: 6.2_
  - [x] 4.3 编写 Property 9 测试 - 超时默认不同步
    - **Property 9: Auto-Dismiss Defaults To No Sync**
    - **Validates: Requirements 6.2**

- [x] 5. 实现同步管理器 (Sync Manager)
  - [x] 5.1 创建 syncManager 工具模块
    - `shouldTriggerSync(canvasIndex)`: 判断是否触发同步
    - `syncToSlaves(property, value, canvases)`: 执行同步
    - `generatePlaceholderText(text)`: 生成占位符文字
    - _Requirements: 3.1, 4.1, 5.1_
  - [x] 5.2 实现 Master/Slave 判断逻辑
    - index === 0 为 Master，触发同步确认
    - index > 0 为 Slave，不触发同步
    - _Requirements: 3.4, 4.6, 5.3_
  - [x] 5.3 编写 Property 3 测试 - Master 触发同步
    - **Property 3: Master Triggers Sync Confirmation**
    - **Validates: Requirements 3.1, 4.1, 5.1**
  - [x] 5.4 编写 Property 4 测试 - Slave 隔离
    - **Property 4: Slave Changes Are Isolated**
    - **Validates: Requirements 3.4, 4.5, 5.3**

- [x] 6. 集成背景同步功能
  - [x] 6.1 修改 BackgroundEditor 组件
    - 检测当前是否为 Master 画布
    - 修改时触发同步确认
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 6.2 实现背景同步逻辑
    - 确认后同步到所有 Slave
    - 拒绝后仅修改当前画布
    - _Requirements: 3.2, 3.3_

- [x] 7. 集成文字图层同步功能
  - [x] 7.1 修改 Sidebar 和文字相关操作
    - 添加文字时触发同步确认
    - 修改样式时触发同步确认
    - 修改内容时触发同步确认
    - _Requirements: 4.1, 4.3, 4.4_
  - [x] 7.2 实现文字占位符同步
    - 同步时生成相同字数的占位符
    - 保持字体、大小、颜色、位置一致
    - _Requirements: 4.2, 4.5_
  - [x] 7.3 编写 Property 12 测试 - 占位符生成
    - **Property 12: Text Content Sync Creates Placeholder**
    - **Validates: Requirements 4.4, 4.5**
  - [x] 7.4 实现文字删除同步
    - Master 删除时询问是否同步删除
    - _Requirements: 4.7_

- [x] 8. 集成截图位置同步功能
  - [x] 8.1 修改 KonvaCanvas 中的截图拖拽逻辑
    - Master 画布拖拽/缩放后触发同步确认
    - _Requirements: 5.1_
  - [x] 8.2 实现位置同步逻辑
    - 使用相对位置（百分比 0-1）
    - 同步到所有 Slave 画布
    - _Requirements: 5.2, 5.4_
  - [x] 8.3 编写 Property 8 测试 - 相对位置
    - **Property 8: Position Values Are Relative**
    - **Validates: Requirements 5.4**

- [x] 9. 实现批量模式
  - [x] 9.1 添加批量模式开关
    - 在 CanvasArea 顶部添加 "批量模式" 切换按钮
    - 开启时显示持久指示器
    - _Requirements: 6.3, 6.4_
  - [x] 9.2 实现批量模式逻辑
    - 开启时跳过同步确认，自动同步
    - _Requirements: 6.3_
  - [x] 9.3 编写 Property 6 测试 - 批量模式
    - **Property 6: Batch Mode Auto-Sync**
    - **Validates: Requirements 6.3**

- [x] 10. 实现记住选择功能
  - [x] 10.1 存储用户选择
    - 按属性类型存储选择（background/textStyle/position）
    - _Requirements: 3.5_
  - [x] 10.2 应用记住的选择
    - 后续操作自动使用记住的选择
    - _Requirements: 3.5_
  - [x] 10.3 编写 Property 7 测试 - 记住选择
    - **Property 7: Remember Choice Persistence**
    - **Validates: Requirements 3.5**

- [x] 11. 实现批量导出功能
  - [x] 11.1 修改 ExportPanel 组件
    - 添加 "导出全部" 按钮
    - 显示将导出的画布数量
    - _Requirements: 7.2_
  - [x] 11.2 实现批量导出逻辑
    - 依次导出每个画布
    - 文件命名：screenshot_1.png, screenshot_2.png...
    - _Requirements: 7.2, 7.3_

- [x] 12. 实现状态持久化
  - [x] 12.1 扩展 exportState/importState
    - 支持多画布状态序列化
    - _Requirements: 7.1_
  - [x] 12.2 编写 Property 10 测试 - 状态往返
    - **Property 10: Canvas State Serialization Round-Trip**
    - **Validates: Requirements 7.1**

- [x] 13. Checkpoint - 核心功能验收
  - 所有 13 个测试通过 ✓
  - 多画布创建、切换、同步流程已实现 ✓

- [x] 14. UI 优化和收尾
  - [x] 14.1 优化画布切换器样式
    - 响应式布局
    - 动画过渡效果
  - [x] 14.2 优化同步确认弹窗位置
    - 底部居中显示
    - slide-up 动画
  - [x] 14.3 添加操作提示
    - Master 画布标识
    - 同步状态反馈

## Notes

- 所有 14 个任务已完成 ✓
- 所有 12 个属性测试已通过 ✓
- 使用 fast-check 库进行属性测试，每个测试运行 100 次迭代
- 位置值统一使用 0-1 百分比，确保不同尺寸画布间同步正确
- GEB 文档系统已创建 (L1/L2 CLAUDE.md)
