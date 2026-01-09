import KonvaCanvas from '../canvas/KonvaCanvas'

export default function CanvasArea() {
  return (
    <main className="flex-1 bg-surface-50 flex items-center justify-center overflow-hidden">
      <KonvaCanvas />
    </main>
  )
}
