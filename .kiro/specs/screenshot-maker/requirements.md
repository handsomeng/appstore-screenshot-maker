# Requirements Document

## Introduction

App Store Screenshot Maker 是一个 Web 端工具，帮助独立开发者快速制作 App Store 上架所需的宣传截图。用户可以上传应用截图，自动放置到设备框架中，添加宣传文字，选择背景样式，最终导出符合 App Store 规范的图片素材。

## Glossary

- **Screenshot_Maker**: 截图制作工具的核心系统
- **Device_Frame**: 设备边框模板，如 iPhone、iPad 的外观框架
- **Canvas**: 画布，用户编辑截图的工作区域
- **Text_Layer**: 文字图层，浮动在截图上方的可编辑文字
- **Export_Module**: 导出模块，负责生成最终图片文件
- **Template**: 预设模板，包含设备、尺寸、布局的组合配置

## Requirements

### Requirement 1: 截图上传与放置

**User Story:** As a 独立开发者, I want to 上传应用截图并自动放置到设备框架中, so that 我可以快速创建专业的宣传图片。

#### Acceptance Criteria

1. WHEN 用户拖拽或点击上传图片 THEN THE Screenshot_Maker SHALL 接受 PNG、JPG、JPEG 格式的图片文件
2. WHEN 图片上传成功 THEN THE Screenshot_Maker SHALL 将截图自动放置到 Canvas 中央偏下位置
3. WHEN 截图放置完成 THEN THE Screenshot_Maker SHALL 自动适配 Device_Frame 的屏幕区域尺寸
4. WHEN 用户上传多张截图 THEN THE Screenshot_Maker SHALL 支持在多个画布间切换编辑
5. IF 上传的文件格式不支持 THEN THE Screenshot_Maker SHALL 显示错误提示并拒绝上传

### Requirement 2: 设备框架选择

**User Story:** As a 独立开发者, I want to 选择不同的设备框架样式, so that 我的截图能匹配目标设备的外观。

#### Acceptance Criteria

1. THE Screenshot_Maker SHALL 提供 iPhone 系列设备框架（iPhone 15 Pro、iPhone 15、iPhone SE）
2. THE Screenshot_Maker SHALL 提供 iPad 系列设备框架（iPad Pro 12.9"、iPad Pro 11"）
3. WHEN 用户选择设备框架 THEN THE Canvas SHALL 自动调整为对应设备的屏幕比例
4. WHEN 用户切换设备框架 THEN THE Screenshot_Maker SHALL 保留已上传的截图内容
5. THE Screenshot_Maker SHALL 支持无框架模式（纯截图展示）

### Requirement 3: 文字编辑

**User Story:** As a 独立开发者, I want to 在截图上添加宣传文字, so that 我可以突出应用的核心卖点。

#### Acceptance Criteria

1. WHEN 用户点击添加文字 THEN THE Screenshot_Maker SHALL 创建一个可编辑的 Text_Layer
2. THE Text_Layer SHALL 支持拖拽移动到 Canvas 任意位置
3. THE Text_Layer SHALL 支持选择字体（系统字体 + 预设中文字体）
4. THE Text_Layer SHALL 支持设置字体大小（12px - 120px）
5. THE Text_Layer SHALL 支持设置文字颜色（颜色选择器）
6. THE Text_Layer SHALL 支持文字对齐方式（左对齐、居中、右对齐）
7. WHEN 用户双击 Text_Layer THEN THE Screenshot_Maker SHALL 进入文字编辑模式
8. THE Screenshot_Maker SHALL 支持添加多个 Text_Layer

### Requirement 4: 背景样式

**User Story:** As a 独立开发者, I want to 自定义截图的背景样式, so that 我的宣传图更加美观吸引人。

#### Acceptance Criteria

1. THE Screenshot_Maker SHALL 支持纯色背景选择
2. THE Screenshot_Maker SHALL 支持渐变色背景（线性渐变、径向渐变）
3. THE Screenshot_Maker SHALL 提供预设背景色方案（至少 10 种）
4. WHEN 用户选择背景色 THEN THE Canvas SHALL 实时预览背景效果
5. THE Screenshot_Maker SHALL 支持自定义渐变方向和颜色节点

### Requirement 5: 导出功能

**User Story:** As a 独立开发者, I want to 导出符合 App Store 规范的图片, so that 我可以直接上传到 App Store Connect。

#### Acceptance Criteria

1. THE Export_Module SHALL 支持 App Store 标准尺寸预设：
   - iPhone 6.7" (1290 x 2796)
   - iPhone 6.5" (1284 x 2778)
   - iPhone 5.5" (1242 x 2208)
   - iPad Pro 12.9" (2048 x 2732)
   - iPad Pro 11" (1668 x 2388)
2. THE Export_Module SHALL 支持自定义导出尺寸
3. WHEN 用户点击导出 THEN THE Export_Module SHALL 生成 PNG 格式图片
4. THE Export_Module SHALL 支持批量导出多个画布
5. WHEN 导出完成 THEN THE Screenshot_Maker SHALL 自动下载生成的图片文件
6. THE Export_Module SHALL 支持导出 JPG 格式（可选质量压缩）

### Requirement 6: 多图拼接

**User Story:** As a 独立开发者, I want to 将多张截图拼接成一张宣传图, so that 我可以在一张图中展示多个功能。

#### Acceptance Criteria

1. THE Screenshot_Maker SHALL 支持横向拼接模式（2-4 张图）
2. THE Screenshot_Maker SHALL 支持纵向拼接模式（2-3 张图）
3. WHEN 用户选择拼接模式 THEN THE Canvas SHALL 显示对应的布局网格
4. THE Screenshot_Maker SHALL 支持调整拼接图片之间的间距
5. WHEN 拼接完成 THEN THE Export_Module SHALL 将拼接结果作为单张图片导出

### Requirement 7: 项目保存与模板

**User Story:** As a 独立开发者, I want to 保存我的编辑进度和创建模板, so that 我可以复用设计或继续编辑。

#### Acceptance Criteria

1. THE Screenshot_Maker SHALL 支持将当前编辑状态保存为 JSON 文件
2. WHEN 用户导入 JSON 文件 THEN THE Screenshot_Maker SHALL 恢复之前的编辑状态
3. THE Screenshot_Maker SHALL 提供预设模板（至少 5 种常用布局）
4. WHEN 用户选择模板 THEN THE Canvas SHALL 应用模板的布局和样式设置
5. THE Screenshot_Maker SHALL 支持将当前设计保存为自定义模板
