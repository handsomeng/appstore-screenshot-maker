# Implementation Plan: App Store Screenshot Maker

## Overview

基于 React + Vite + Fabric.js 构建截图制作工具，采用增量开发方式，先搭建核心框架，再逐步添加功能模块。所有处理在浏览器端完成，无需后端。

## Tasks

- [ ] 1. 项目初始化与基础架构
  - [ ] 1.1 创建 Vite + React 项目，配置基础依赖
    - 初始化 Vite + React 项目
    - 安装依赖：fabric, zustand, file-saver, @headlessui/react
    - 配置 Tailwind CSS
    - 创建基础目录结构（components/, stores/, utils/）
    - _Requirements: 全局_

  - [ ] 1.2 创建 UI 基础组件库
    - 创建 Button 组件（primary/secondary/ghost 变体）
    - 创建 Input、Slider、Dropdown 组件
    - 创建 Modal、Toast 组件
    - 创建 ColorPicker 组件（颜色选择器 + 预设色板）
    - 创建 IconButton、Tabs、Tooltip 组件
    - 定义设计 tokens（颜色变量、间距、圆角、阴影）
    - _Requirements: 全局_

  - [ ] 1.3 创建基础布局组件
    - 实现 App Shell 三栏布局
    - 创建 Sidebar 组件（左侧工具栏）
    - 创建 CanvasArea 组件（中央画布区域）
    - 创建 PropertiesPanel 组件（右侧属性面板）
    - 设置响应式断点
    - _Requirements: 全局_

  - [ ] 1.4 创建 Zustand 状态管理 store
    - 定义 CanvasState 接口（screenshots, activeScreenshotId, deviceFrame, background, textLayers, exportSettings）
    - 实现基础 actions：setActiveScreenshot, updateBackground, addTextLayer, removeTextLayer
    - _Requirements: 全局_

- [ ] 2. 画布核心功能
  - [ ] 2.1 实现 FabricCanvas 组件
    - 封装 Fabric.js canvas 初始化
    - 实现画布尺寸自适应容器
    - 实现画布缩放和平移功能
    - _Requirements: 1.2, 2.3_

  - [ ] 2.2 实现图片上传功能
    - 创建 ImageUploader 组件（支持拖拽 + 点击上传）
    - 实现文件格式验证（PNG、JPG、JPEG，不区分大小写）
    - 实现文件大小限制（<10MB）
    - 上传后自动放置到画布中央偏下位置
    - _Requirements: 1.1, 1.2, 1.5_

  - [ ]* 2.3 编写文件格式验证属性测试
    - **Property 1: 文件格式验证**
    - 测试有效扩展名（png/jpg/jpeg，大小写不敏感）被接受
    - 测试无效扩展名被拒绝并显示错误
    - **Validates: Requirements 1.1, 1.5**

  - [ ]* 2.4 编写截图位置放置属性测试
    - **Property 2: 截图位置放置**
    - 测试图片水平居中（x 在画布宽度 40%-60%）
    - 测试图片垂直偏下（y 在画布高度 50%-80%）
    - **Validates: Requirements 1.2**

- [ ] 3. Checkpoint - 确保基础画布功能正常
  - 确保所有测试通过，如有问题请询问用户

- [ ] 4. 设备框架功能
  - [ ] 4.1 创建设备框架配置数据
    - 定义 DEVICE_FRAMES 常量
    - 包含 iPhone 15 Pro、iPhone 15、iPhone SE
    - 包含 iPad Pro 12.9"、iPad Pro 11"
    - 定义每个设备的 screenArea 和 aspectRatio
    - 准备设备框架 SVG/PNG 资源
    - _Requirements: 2.1, 2.2_

  - [ ] 4.2 实现 DeviceSelector 组件
    - 设备列表展示（带预览图）
    - 选择后更新画布比例
    - 支持无框架模式
    - _Requirements: 2.3, 2.5_

  - [ ] 4.3 实现 DeviceFrame 渲染
    - 在画布上叠加设备框架图片
    - 截图自动缩放适配屏幕区域
    - 保持截图原始宽高比
    - _Requirements: 1.3, 2.3_

  - [ ]* 4.4 编写设备框架适配属性测试
    - **Property 3: 设备框架适配**
    - 测试截图完全适配设备屏幕区域
    - 测试截图保持原始宽高比
    - **Validates: Requirements 1.3, 2.3**

  - [ ]* 4.5 编写设备切换状态保持属性测试
    - **Property 4: 设备切换状态保持**
    - 测试切换设备后截图数据不变
    - **Validates: Requirements 2.4**

- [ ] 5. 文字编辑功能
  - [ ] 5.1 实现 TextLayer 组件
    - 创建可编辑文字对象（Fabric.js IText）
    - 支持拖拽移动到任意位置
    - 双击进入编辑模式
    - _Requirements: 3.1, 3.2, 3.7_

  - [ ] 5.2 实现文字属性编辑
    - 创建 FontSelector 组件（系统字体 + 预设中文字体）
    - 字体大小滑块（12-120px，带范围限制）
    - ColorPicker 颜色选择
    - 对齐方式切换（左/中/右）
    - _Requirements: 3.3, 3.4, 3.5, 3.6_

  - [ ] 5.3 实现多文字图层管理
    - 图层列表展示
    - 图层选择、删除、复制功能
    - 每个图层有唯一 ID
    - _Requirements: 3.8_

  - [ ]* 5.4 编写字体大小范围限制属性测试
    - **Property 5: 字体大小范围限制**
    - 测试小于 12 的值被限制为 12
    - 测试大于 120 的值被限制为 120
    - 测试 12-120 范围内的值保持不变
    - **Validates: Requirements 3.4**

  - [ ]* 5.5 编写多文字图层管理属性测试
    - **Property 6: 多文字图层管理**
    - 测试每个图层有唯一 ID
    - 测试图层数量 = 添加次数 - 删除次数
    - **Validates: Requirements 3.8**

- [ ] 6. Checkpoint - 确保文字编辑功能正常
  - 确保所有测试通过，如有问题请询问用户

- [ ] 7. 背景样式功能
  - [ ] 7.1 实现 BackgroundEditor 组件
    - 纯色背景选择
    - 渐变色背景（线性、径向）
    - 渐变方向和颜色节点编辑
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 7.2 创建预设背景方案
    - 定义 BACKGROUND_PRESETS（至少 10 种）
    - 包含深空蓝、日落橙、薄荷绿、纯白、纯黑等
    - 预设选择 UI
    - _Requirements: 4.3_

  - [ ] 7.3 实现背景实时预览
    - 背景变更即时反映到画布
    - _Requirements: 4.4_

- [ ] 8. 导出功能
  - [ ] 8.1 创建导出尺寸预设配置
    - 定义 EXPORT_PRESETS 常量
    - iPhone 6.7" (1290x2796)、6.5" (1284x2778)、5.5" (1242x2208)
    - iPad Pro 12.9" (2048x2732)、11" (1668x2388)
    - 自定义尺寸选项
    - _Requirements: 5.1_

  - [ ] 8.2 实现 ExportDialog 组件
    - 尺寸预设选择下拉框
    - 自定义尺寸输入（限制 100-4096 像素）
    - 格式选择（PNG/JPG）
    - JPG 质量滑块设置
    - _Requirements: 5.1, 5.2, 5.3, 5.6_

  - [ ] 8.3 实现导出工具函数
    - 使用 Fabric.js toDataURL 导出
    - 使用 FileSaver.js 触发下载
    - 处理画布为空的情况
    - _Requirements: 5.3, 5.5_

  - [ ]* 8.4 编写导出尺寸正确性属性测试
    - **Property 7: 导出尺寸正确性**
    - 测试生成图片尺寸精确匹配指定宽高
    - **Validates: Requirements 5.2**

- [ ] 9. 多图拼接功能
  - [ ] 9.1 实现拼接模式选择
    - 横向拼接模式（2-4 张）
    - 纵向拼接模式（2-3 张）
    - 布局网格预览
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 9.2 实现拼接间距调整
    - 间距滑块控制
    - 实时预览间距效果
    - _Requirements: 6.4_

  - [ ] 9.3 实现拼接导出
    - 合并多个画布为单张图片
    - _Requirements: 6.5_

  - [ ]* 9.4 编写拼接布局正确性属性测试
    - **Property 9: 拼接布局正确性**
    - 测试横向拼接图片在同一水平线
    - 测试纵向拼接图片在同一垂直线
    - 测试相邻图片间距等于指定值
    - **Validates: Requirements 6.1, 6.2, 6.4**

- [ ] 10. 批量导出与多画布管理
  - [ ] 10.1 实现多画布管理
    - 画布列表展示（缩略图）
    - 画布切换、添加、删除
    - _Requirements: 1.4_

  - [ ] 10.2 实现批量导出
    - 选择要导出的画布
    - 批量生成并打包下载（ZIP 或逐个下载）
    - _Requirements: 5.4_

  - [ ]* 10.3 编写批量导出完整性属性测试
    - **Property 8: 批量导出完整性**
    - 测试 N 个画布生成恰好 N 个图片文件
    - **Validates: Requirements 5.4**

- [ ] 11. Checkpoint - 确保导出功能正常
  - 确保所有测试通过，如有问题请询问用户

- [ ] 12. 项目保存与模板功能
  - [ ] 12.1 实现项目保存为 JSON
    - 序列化完整画布状态（screenshots, textLayers, background, deviceFrame）
    - 触发 JSON 文件下载
    - _Requirements: 7.1_

  - [ ] 12.2 实现 JSON 导入恢复
    - 文件选择上传
    - JSON 格式验证
    - 反序列化并恢复画布状态
    - 处理版本不兼容情况
    - _Requirements: 7.2_

  - [ ]* 12.3 编写项目状态 Round-Trip 属性测试
    - **Property 10: 项目状态 Round-Trip**
    - 测试保存后导入恢复出等价状态
    - 验证截图数据、文字图层、背景设置、设备框架都相同
    - **Validates: Requirements 7.1, 7.2**

  - [ ] 12.4 创建预设模板
    - 定义至少 5 种常用布局模板
    - 模板选择 UI（带预览）
    - 应用模板到当前画布
    - _Requirements: 7.3, 7.4_

  - [ ] 12.5 实现自定义模板保存
    - 将当前设计保存为模板
    - 模板管理（查看、删除）
    - 存储到 localStorage
    - _Requirements: 7.5_

- [ ] 13. Final Checkpoint - 最终验收
  - 确保所有测试通过
  - 验证所有功能正常工作
  - 如有问题请询问用户

## Notes

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求条目以便追溯
- Checkpoint 任务用于阶段性验证，确保增量开发的稳定性
- 属性测试使用 fast-check 库，每个测试运行至少 100 次迭代
- 所有处理在浏览器端完成，无需后端服务
