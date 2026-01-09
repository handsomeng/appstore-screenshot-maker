# Design Document

## Overview

App Store Screenshot Maker 是一个基于 Web 的截图制作工具，采用 React + Vite 构建，使用 Fabric.js 作为 Canvas 操作库，支持图片上传、设备框架叠加、文字编辑、背景样式设置和多尺寸导出。

### 技术选型

- **前端框架**: React 18 + Vite
- **样式方案**: Tailwind CSS
- **Canvas 库**: Fabric.js（用于图层操作、拖拽、缩放）
- **状态管理**: Zustand（轻量级状态管理）
- **图片处理**: 原生 Canvas API + Fabric.js 导出
- **文件处理**: FileSaver.js（下载导出）
- **UI 组件**: Headless UI + 自定义组件

### 设计原则

1. **单页应用**: 所有功能在一个页面完成，无需路由
2. **实时预览**: 所有编辑操作即时反映到画布
3. **本地优先**: 所有处理在浏览器端完成，无需后端
4. **响应式设计**: 支持桌面端操作，移动端预览

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Shell                             │
├─────────────┬─────────────────────────┬─────────────────────┤
│  Sidebar    │      Canvas Area        │   Properties Panel  │
│  - Upload   │  ┌─────────────────┐    │   - Text Settings   │
│  - Devices  │  │                 │    │   - Background      │
│  - Templates│  │   Fabric.js     │    │   - Export Options  │
│  - Export   │  │   Canvas        │    │                     │
│             │  │                 │    │                     │
│             │  └─────────────────┘    │                     │
└─────────────┴─────────────────────────┴─────────────────────┘
```

### 数据流

```
User Action → Zustand Store → Fabric.js Canvas → Visual Update
                    ↓
              State Persistence (localStorage / JSON export)
```

## Components and Interfaces

### 核心组件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx          # 左侧工具栏
│   │   ├── CanvasArea.jsx       # 中央画布区域
│   │   └── PropertiesPanel.jsx  # 右侧属性面板
│   ├── canvas/
│   │   ├── FabricCanvas.jsx     # Fabric.js 画布封装
│   │   ├── DeviceFrame.jsx      # 设备框架渲染
│   │   └── TextLayer.jsx        # 文字图层组件
│   ├── controls/
│   │   ├── ImageUploader.jsx    # 图片上传组件
│   │   ├── DeviceSelector.jsx   # 设备选择器
│   │   ├── ColorPicker.jsx      # 颜色选择器
│   │   ├── FontSelector.jsx     # 字体选择器
│   │   ├── BackgroundEditor.jsx # 背景编辑器
│   │   └── ExportDialog.jsx     # 导出对话框
│   └── ui/
│       ├── Button.jsx
│       ├── Slider.jsx
│       └── Dropdown.jsx
├── stores/
│   └── canvasStore.js           # Zustand 状态管理
├── utils/
│   ├── exportUtils.js           # 导出工具函数
│   ├── deviceFrames.js          # 设备框架配置
│   └── presets.js               # 预设模板配置
└── App.jsx
```

### 接口定义

```typescript
// 画布状态接口
interface CanvasState {
  screenshots: Screenshot[];
  activeScreenshotId: string | null;
  deviceFrame: DeviceFrame | null;
  background: BackgroundConfig;
  textLayers: TextLayer[];
  exportSettings: ExportSettings;
}

// 截图对象
interface Screenshot {
  id: string;
  imageData: string;        // base64 图片数据
  position: { x: number; y: number };
  scale: number;
}

// 设备框架配置
interface DeviceFrame {
  id: string;
  name: string;             // "iPhone 15 Pro"
  frameImage: string;       // 框架图片路径
  screenArea: {             // 屏幕区域（相对于框架）
    x: number;
    y: number;
    width: number;
    height: number;
  };
  aspectRatio: number;
}

// 文字图层
interface TextLayer {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontFamily: string;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

// 背景配置
interface BackgroundConfig {
  type: 'solid' | 'gradient';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;         // 线性渐变角度
  };
}

// 导出设置
interface ExportSettings {
  preset: string;           // 预设尺寸名称
  width: number;
  height: number;
  format: 'png' | 'jpg';
  quality: number;          // JPG 质量 0-1
}
```

## Data Models

### 设备框架预设

```javascript
const DEVICE_FRAMES = {
  'iphone-15-pro': {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    frameImage: '/frames/iphone-15-pro.png',
    screenArea: { x: 26, y: 26, width: 393, height: 852 },
    aspectRatio: 393 / 852
  },
  'iphone-15': {
    id: 'iphone-15',
    name: 'iPhone 15',
    frameImage: '/frames/iphone-15.png',
    screenArea: { x: 24, y: 24, width: 390, height: 844 },
    aspectRatio: 390 / 844
  },
  // ... 更多设备
};
```

### 导出尺寸预设

```javascript
const EXPORT_PRESETS = {
  'iphone-6.7': { name: 'iPhone 6.7"', width: 1290, height: 2796 },
  'iphone-6.5': { name: 'iPhone 6.5"', width: 1284, height: 2778 },
  'iphone-5.5': { name: 'iPhone 5.5"', width: 1242, height: 2208 },
  'ipad-12.9': { name: 'iPad 12.9"', width: 2048, height: 2732 },
  'ipad-11': { name: 'iPad 11"', width: 1668, height: 2388 },
  'custom': { name: '自定义尺寸', width: 0, height: 0 }
};
```

### 预设背景方案

```javascript
const BACKGROUND_PRESETS = [
  { name: '深空蓝', type: 'gradient', colors: ['#0f0c29', '#302b63', '#24243e'] },
  { name: '日落橙', type: 'gradient', colors: ['#ff6b6b', '#feca57'] },
  { name: '薄荷绿', type: 'solid', color: '#00b894' },
  { name: '纯白', type: 'solid', color: '#ffffff' },
  { name: '纯黑', type: 'solid', color: '#000000' },
  // ... 更多预设
];
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 文件格式验证

*For any* 上传的文件，如果文件扩展名是 PNG、JPG 或 JPEG（不区分大小写），系统应该接受该文件；否则应该拒绝并显示错误提示。

**Validates: Requirements 1.1, 1.5**

### Property 2: 截图位置放置

*For any* 成功上传的图片，其在画布上的位置应该满足：水平方向居中（x 坐标在画布宽度的 40%-60% 范围内），垂直方向偏下（y 坐标在画布高度的 50%-80% 范围内）。

**Validates: Requirements 1.2**

### Property 3: 设备框架适配

*For any* 上传的截图和选择的设备框架，截图应该被缩放以完全适配设备框架的屏幕区域，且保持原始宽高比。

**Validates: Requirements 1.3, 2.3**

### Property 4: 设备切换状态保持

*For any* 已上传的截图集合，当用户切换设备框架时，所有截图的图片数据应该保持不变。

**Validates: Requirements 2.4**

### Property 5: 字体大小范围限制

*For any* 设置的字体大小值，如果值小于 12，应该被限制为 12；如果值大于 120，应该被限制为 120；否则应该使用原始值。

**Validates: Requirements 3.4**

### Property 6: 多文字图层管理

*For any* 添加的文字图层序列，系统应该正确维护所有图层，每个图层都有唯一 ID，且图层数量等于添加操作的次数减去删除操作的次数。

**Validates: Requirements 3.8**

### Property 7: 导出尺寸正确性

*For any* 自定义的导出宽度和高度，生成的图片文件尺寸应该精确匹配指定的宽高值。

**Validates: Requirements 5.2**

### Property 8: 批量导出完整性

*For any* 包含 N 个画布的项目，批量导出应该生成恰好 N 个图片文件。

**Validates: Requirements 5.4**

### Property 9: 拼接布局正确性

*For any* 拼接模式（横向 2-4 张或纵向 2-3 张）和指定的间距值，拼接后的图片应该满足：
- 横向拼接：所有图片在同一水平线上，相邻图片间距等于指定值
- 纵向拼接：所有图片在同一垂直线上，相邻图片间距等于指定值

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 10: 项目状态 Round-Trip

*For any* 有效的画布状态，将其保存为 JSON 然后重新导入，应该恢复出与原始状态等价的画布（截图数据、文字图层、背景设置、设备框架选择都相同）。

**Validates: Requirements 7.1, 7.2**

## Error Handling

### 文件上传错误

| 错误场景 | 处理方式 |
|---------|---------|
| 文件格式不支持 | 显示 Toast 提示"仅支持 PNG、JPG、JPEG 格式" |
| 文件过大（>10MB） | 显示 Toast 提示"文件大小不能超过 10MB" |
| 文件读取失败 | 显示 Toast 提示"文件读取失败，请重试" |

### 导出错误

| 错误场景 | 处理方式 |
|---------|---------|
| 画布为空 | 禁用导出按钮，提示"请先添加截图" |
| 导出尺寸无效 | 限制输入范围 100-4096 像素 |
| 浏览器不支持下载 | 提供备用方案（新窗口打开图片） |

### JSON 导入错误

| 错误场景 | 处理方式 |
|---------|---------|
| JSON 格式错误 | 显示 Toast 提示"文件格式错误" |
| 版本不兼容 | 尝试迁移，失败则提示"项目版本不兼容" |

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试，覆盖以下模块：

- **工具函数测试**: `exportUtils.js`, `deviceFrames.js`, `presets.js`
- **状态管理测试**: `canvasStore.js` 的 actions 和 selectors
- **组件测试**: 使用 React Testing Library 测试关键组件

### 属性测试

使用 fast-check 进行属性测试，每个属性测试运行至少 100 次迭代：

```javascript
// 示例：文件格式验证属性测试
// Feature: screenshot-maker, Property 1: 文件格式验证
test.prop([fc.string()])('valid file extensions are accepted', (filename) => {
  const validExtensions = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
  const ext = filename.split('.').pop()?.toLowerCase();
  const isValid = validExtensions.includes(ext);
  expect(validateFileFormat(filename)).toBe(isValid);
});
```

### 测试覆盖目标

- 单元测试覆盖率 > 80%
- 所有 10 个正确性属性都有对应的属性测试
- 关键用户流程有集成测试覆盖
