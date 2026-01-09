import { create } from 'zustand'

const initialState = {
  // 截图列表
  screenshots: [],
  activeScreenshotId: null,
  
  // 设备框架
  deviceFrame: null,
  
  // 画布尺寸
  canvasSize: { width: 430, height: 932 },
  
  // 背景配置
  background: {
    type: 'solid',
    color: '#ffffff',
    gradient: null,
  },
  
  // 文字图层
  textLayers: [],
  activeTextLayerId: null,
  selectedTextLayerIds: [], // 多选支持
  
  // 导出设置
  exportSettings: {
    preset: 'iphone-6.7',
    width: 1290,
    height: 2796,
    format: 'png',
    quality: 0.9,
  },
  
  // 多画布管理
  canvases: [{ id: 'canvas-1', name: '画布 1' }],
  activeCanvasId: 'canvas-1',
}

export const useCanvasStore = create((set, get) => ({
  ...initialState,

  // 截图操作
  addScreenshot: (screenshot) => set((state) => ({
    screenshots: [...state.screenshots, {
      id: `screenshot-${Date.now()}`,
      imageData: screenshot.imageData,
      position: screenshot.position || { x: 0.5, y: 0.65 },
      scale: screenshot.scale || 1,
    }],
  })),

  removeScreenshot: (id) => set((state) => ({
    screenshots: state.screenshots.filter(s => s.id !== id),
    activeScreenshotId: state.activeScreenshotId === id ? null : state.activeScreenshotId,
  })),

  setActiveScreenshot: (id) => set({ activeScreenshotId: id }),

  updateScreenshot: (id, updates) => set((state) => ({
    screenshots: state.screenshots.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ),
  })),

  // 设备框架操作
  setDeviceFrame: (frame) => set({ deviceFrame: frame }),

  // 画布尺寸操作
  setCanvasSize: (size) => set({ canvasSize: size }),

  // 背景操作
  updateBackground: (background) => set((state) => ({
    background: { ...state.background, ...background },
  })),

  setBackgroundColor: (color) => set((state) => ({
    background: { ...state.background, type: 'solid', color },
  })),

  setBackgroundGradient: (gradient) => set((state) => ({
    background: { ...state.background, type: 'gradient', gradient },
  })),

  // 文字图层操作
  addTextLayer: (text = '双击编辑文字') => {
    const id = `text-${Date.now()}`
    set((state) => ({
      textLayers: [...state.textLayers, {
        id,
        text,
        position: { x: 0.5, y: 0.2 },
        fontFamily: 'system-ui',
        fontSize: 32,
        color: '#000000',
        align: 'center',
      }],
      activeTextLayerId: id,
    }))
    return id
  },

  removeTextLayer: (id) => set((state) => ({
    textLayers: state.textLayers.filter(t => t.id !== id),
    activeTextLayerId: state.activeTextLayerId === id ? null : state.activeTextLayerId,
  })),

  setActiveTextLayer: (id) => set({ activeTextLayerId: id }),

  // 多选文字图层
  toggleTextLayerSelection: (id, isMultiSelect) => set((state) => {
    if (isMultiSelect) {
      const isSelected = state.selectedTextLayerIds.includes(id)
      return {
        selectedTextLayerIds: isSelected
          ? state.selectedTextLayerIds.filter(i => i !== id)
          : [...state.selectedTextLayerIds, id],
        activeTextLayerId: id,
      }
    }
    return {
      selectedTextLayerIds: [id],
      activeTextLayerId: id,
    }
  }),

  clearTextLayerSelection: () => set({ selectedTextLayerIds: [], activeTextLayerId: null }),

  // 批量更新选中的文字图层
  updateSelectedTextLayers: (updates) => set((state) => ({
    textLayers: state.textLayers.map(t =>
      state.selectedTextLayerIds.includes(t.id) ? { ...t, ...updates } : t
    ),
  })),

  updateTextLayer: (id, updates) => set((state) => ({
    textLayers: state.textLayers.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ),
  })),

  // 导出设置操作
  updateExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings },
  })),

  // 多画布操作
  addCanvas: () => {
    const id = `canvas-${Date.now()}`
    set((state) => ({
      canvases: [...state.canvases, { id, name: `画布 ${state.canvases.length + 1}` }],
      activeCanvasId: id,
    }))
    return id
  },

  removeCanvas: (id) => set((state) => {
    if (state.canvases.length <= 1) return state
    const newCanvases = state.canvases.filter(c => c.id !== id)
    return {
      canvases: newCanvases,
      activeCanvasId: state.activeCanvasId === id ? newCanvases[0].id : state.activeCanvasId,
    }
  }),

  setActiveCanvas: (id) => set({ activeCanvasId: id }),

  // 重置状态
  reset: () => set(initialState),

  // 导出状态（用于保存项目）
  exportState: () => {
    const state = get()
    return {
      screenshots: state.screenshots,
      deviceFrame: state.deviceFrame,
      background: state.background,
      textLayers: state.textLayers,
      exportSettings: state.exportSettings,
    }
  },

  // 导入状态（用于恢复项目）
  importState: (data) => set({
    screenshots: data.screenshots || [],
    deviceFrame: data.deviceFrame || null,
    background: data.background || initialState.background,
    textLayers: data.textLayers || [],
    exportSettings: data.exportSettings || initialState.exportSettings,
  }),
}))
