/**
 * [L3] 多画布状态管理
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 * 
 * 核心职责：
 * - 管理多画布状态 (最多 6 个)
 * - Master/Slave 模式同步
 * - 同步设置持久化
 */
import { create } from 'zustand'

// 最大画布数量
const MAX_CANVASES = 6
// 最小画布尺寸
const MIN_CANVAS_SIZE = 200

// 创建单个画布的初始状态
const createCanvasState = (index) => ({
  id: `canvas-${Date.now()}-${index}`,
  index,
  screenshot: null,
  background: {
    type: 'solid',
    color: '#ffffff',
    gradient: null,
  },
  textLayers: [],
  canvasSize: { width: 430, height: 932 },
})

// 初始状态
const initialState = {
  // 多画布列表
  canvases: [createCanvasState(0)],
  activeCanvasIndex: 0,
  
  // 同步设置
  syncSettings: {
    batchMode: true,  // 默认开启实时同步
    rememberChoice: {
      background: null,
      textStyle: null,
      textContent: null,
      position: null,
      canvasSize: null,
    },
  },
  
  // 待处理的同步请求
  pendingSync: null,
  
  // 导出设置
  exportSettings: {
    format: 'png',
    quality: 0.9,
  },
  
  // 当前选中的元素
  activeScreenshotId: null,
  activeTextLayerId: null,
  selectedTextLayerIds: [],
}

export const useCanvasStore = create((set, get) => ({
  ...initialState,

  // ========== 画布 CRUD 操作 ==========
  
  // 添加画布 (上传截图时调用)
  addCanvas: (screenshot = null) => {
    const state = get()
    if (state.canvases.length >= MAX_CANVASES) {
      return { success: false, reason: 'max_reached' }
    }
    
    const newIndex = state.canvases.length
    const newCanvas = createCanvasState(newIndex)
    
    if (screenshot) {
      newCanvas.screenshot = {
        id: `screenshot-${Date.now()}`,
        imageData: screenshot.imageData,
        position: screenshot.position || { x: 0.5, y: 0.65 },
        scale: screenshot.scale || 1,
      }
    }
    
    set({
      canvases: [...state.canvases, newCanvas],
      // 不自动切换到新画布，保持当前选中
    })
    
    return { success: true, index: newIndex }
  },

  // 删除画布
  removeCanvas: (index) => {
    const state = get()
    if (state.canvases.length <= 1) {
      return { success: false, reason: 'min_reached' }
    }
    
    const newCanvases = state.canvases
      .filter((_, i) => i !== index)
      .map((canvas, i) => ({ ...canvas, index: i })) // 重新索引
    
    const newActiveIndex = state.activeCanvasIndex >= newCanvases.length
      ? newCanvases.length - 1
      : state.activeCanvasIndex > index
        ? state.activeCanvasIndex - 1
        : state.activeCanvasIndex
    
    set({
      canvases: newCanvases,
      activeCanvasIndex: newActiveIndex,
    })
    
    return { success: true }
  },

  // 切换当前画布
  setActiveCanvas: (index) => {
    const state = get()
    if (index >= 0 && index < state.canvases.length) {
      set({ 
        activeCanvasIndex: index,
        activeScreenshotId: null,
        activeTextLayerId: null,
        selectedTextLayerIds: [],
      })
    }
  },

  // 获取当前画布
  getActiveCanvas: () => {
    const state = get()
    return state.canvases[state.activeCanvasIndex]
  },

  // 判断是否为 Master 画布
  isMasterCanvas: () => get().activeCanvasIndex === 0,

  // ========== 画布属性更新 ==========

  // 更新指定画布
  updateCanvas: (index, updates) => set((state) => ({
    canvases: state.canvases.map((canvas, i) =>
      i === index ? { ...canvas, ...updates } : canvas
    ),
  })),

  // 更新当前画布
  updateActiveCanvas: (updates) => {
    const state = get()
    get().updateCanvas(state.activeCanvasIndex, updates)
  },

  // ========== 背景操作 ==========
  
  setBackgroundColor: (color) => {
    const state = get()
    const newBackground = { type: 'solid', color, gradient: null }
    get().updateCanvas(state.activeCanvasIndex, { background: newBackground })
  },

  setBackgroundGradient: (gradient) => {
    const state = get()
    const newBackground = { type: 'gradient', color: '#ffffff', gradient }
    get().updateCanvas(state.activeCanvasIndex, { background: newBackground })
  },

  // ========== 画布尺寸操作 ==========
  
  setCanvasSize: (width, height) => {
    const state = get()
    const clampedWidth = Math.max(MIN_CANVAS_SIZE, width)
    const clampedHeight = Math.max(MIN_CANVAS_SIZE, height)
    get().updateCanvas(state.activeCanvasIndex, {
      canvasSize: { width: clampedWidth, height: clampedHeight },
    })
  },

  // ========== 截图操作 ==========
  
  setScreenshot: (screenshot) => {
    const state = get()
    get().updateCanvas(state.activeCanvasIndex, {
      screenshot: screenshot ? {
        id: `screenshot-${Date.now()}`,
        imageData: screenshot.imageData,
        position: screenshot.position || { x: 0.5, y: 0.65 },
        scale: screenshot.scale || 1,
      } : null,
    })
  },

  updateScreenshot: (updates) => {
    const state = get()
    const canvas = state.canvases[state.activeCanvasIndex]
    if (!canvas.screenshot) return
    
    get().updateCanvas(state.activeCanvasIndex, {
      screenshot: { ...canvas.screenshot, ...updates },
    })
  },

  setActiveScreenshot: (id) => set({ activeScreenshotId: id }),

  // ========== 文字图层操作 ==========
  
  addTextLayer: (text = '双击编辑文字') => {
    const state = get()
    const canvas = state.canvases[state.activeCanvasIndex]
    const id = `text-${Date.now()}`
    
    const newLayer = {
      id,
      text,
      position: { x: 0.5, y: 0.2 },
      fontFamily: 'system-ui',
      fontSize: 32,
      color: '#000000',
      align: 'center',
    }
    
    get().updateCanvas(state.activeCanvasIndex, {
      textLayers: [...canvas.textLayers, newLayer],
    })
    
    set({ activeTextLayerId: id })
    return id
  },

  removeTextLayer: (id) => {
    const state = get()
    const canvas = state.canvases[state.activeCanvasIndex]
    
    get().updateCanvas(state.activeCanvasIndex, {
      textLayers: canvas.textLayers.filter(t => t.id !== id),
    })
    
    if (state.activeTextLayerId === id) {
      set({ activeTextLayerId: null })
    }
  },

  updateTextLayer: (id, updates) => {
    const state = get()
    const canvas = state.canvases[state.activeCanvasIndex]
    
    get().updateCanvas(state.activeCanvasIndex, {
      textLayers: canvas.textLayers.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })
  },

  setActiveTextLayer: (id) => set({ activeTextLayerId: id }),

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

  clearTextLayerSelection: () => set({ 
    selectedTextLayerIds: [], 
    activeTextLayerId: null 
  }),

  // ========== 同步操作 ==========
  
  // 设置待处理的同步请求
  setPendingSync: (syncRequest) => set({ pendingSync: syncRequest }),
  
  // 清除待处理的同步请求
  clearPendingSync: () => set({ pendingSync: null }),

  // 同步到所有 Slave 画布
  syncToSlaves: (property, value) => {
    const state = get()
    const newCanvases = state.canvases.map((canvas, index) => {
      if (index === 0) return canvas // Master 不变
      
      switch (property) {
        case 'background':
          return { ...canvas, background: value }
        case 'canvasSize':
          return { ...canvas, canvasSize: value }
        case 'screenshot.position':
          if (!canvas.screenshot) return canvas
          return {
            ...canvas,
            screenshot: { ...canvas.screenshot, position: value.position, scale: value.scale },
          }
        case 'textLayer.add':
          return {
            ...canvas,
            textLayers: [...canvas.textLayers, { ...value, id: `text-${Date.now()}-${index}` }],
          }
        case 'textLayer.style':
          return {
            ...canvas,
            textLayers: canvas.textLayers.map((t, i) =>
              i === value.layerIndex ? { ...t, ...value.style } : t
            ),
          }
        case 'textLayer.content':
          return {
            ...canvas,
            textLayers: canvas.textLayers.map((t, i) =>
              i === value.layerIndex ? { ...t, text: value.placeholderText } : t
            ),
          }
        case 'textLayer.delete':
          return {
            ...canvas,
            textLayers: canvas.textLayers.filter((_, i) => i !== value.layerIndex),
          }
        default:
          return canvas
      }
    })
    
    set({ canvases: newCanvases })
  },

  // 更新同步设置
  updateSyncSettings: (updates) => set((state) => ({
    syncSettings: { ...state.syncSettings, ...updates },
  })),

  // 设置记住的选择
  setRememberChoice: (property, choice) => set((state) => ({
    syncSettings: {
      ...state.syncSettings,
      rememberChoice: {
        ...state.syncSettings.rememberChoice,
        [property]: choice,
      },
    },
  })),

  // 切换批量模式
  toggleBatchMode: () => set((state) => ({
    syncSettings: {
      ...state.syncSettings,
      batchMode: !state.syncSettings.batchMode,
    },
  })),

  // ========== 导出操作 ==========
  
  updateExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings },
  })),

  // 导出状态 (用于保存项目)
  exportState: () => {
    const state = get()
    return {
      canvases: state.canvases,
      syncSettings: state.syncSettings,
      exportSettings: state.exportSettings,
    }
  },

  // 导入状态 (用于恢复项目)
  importState: (data) => set({
    canvases: data.canvases || [createCanvasState(0)],
    activeCanvasIndex: 0,
    syncSettings: data.syncSettings || initialState.syncSettings,
    exportSettings: data.exportSettings || initialState.exportSettings,
  }),

  // 重置状态
  reset: () => set(initialState),
}))

// 兼容旧 API 的 getter
export const getCanvasState = () => {
  const state = useCanvasStore.getState()
  const canvas = state.canvases[state.activeCanvasIndex]
  return {
    background: canvas.background,
    screenshots: canvas.screenshot ? [canvas.screenshot] : [],
    textLayers: canvas.textLayers,
    canvasSize: canvas.canvasSize,
  }
}
