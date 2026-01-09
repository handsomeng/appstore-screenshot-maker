import { useCanvasStore } from '../../stores/canvasStore'
import { getDeviceList } from '../../utils/deviceFrames'

export default function DeviceSelector({ className = '' }) {
  const { deviceFrame, setDeviceFrame } = useCanvasStore()
  const devices = getDeviceList()

  return (
    <div className={`space-y-2 ${className}`}>
      {devices.map((device) => (
        <button
          key={device.id}
          onClick={() => setDeviceFrame(device.id === 'none' ? null : device)}
          className={`
            w-full flex items-center gap-3 p-3 rounded-lg border transition-colors
            ${(deviceFrame?.id === device.id || (!deviceFrame && device.id === 'none'))
              ? 'border-primary-500 bg-primary-50'
              : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
            }
          `}
        >
          {/* 设备预览图标 */}
          <div 
            className="w-8 h-14 rounded border flex items-center justify-center"
            style={{ 
              backgroundColor: device.color || '#f5f5f7',
              borderColor: device.color === '#f5f5f7' ? '#e5e5e5' : device.color,
            }}
          >
            {device.id !== 'none' && (
              <div 
                className="w-6 h-10 bg-surface-100 rounded-sm"
                style={{ borderRadius: `${(device.borderRadius || 0.08) * 20}px` }}
              />
            )}
          </div>
          
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-surface-900">{device.name}</p>
            {device.id !== 'none' && (
              <p className="text-xs text-surface-500">
                {Math.round(device.aspectRatio * 1000) / 1000}
              </p>
            )}
          </div>

          {/* 选中指示器 */}
          {(deviceFrame?.id === device.id || (!deviceFrame && device.id === 'none')) && (
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
