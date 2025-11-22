'use client'

import { useState, useRef, useEffect } from 'react'
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Move, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { SignatureBox } from './SignatureBoxEditor'

interface SignatureBoxPreviewProps {
  signatureBoxes: SignatureBox[]
  documentTemplate: string
  onUpdatePositions: (boxes: SignatureBox[]) => void
  onClose: () => void
}

function DraggableSignatureBox({
  box,
  containerWidth,
  containerHeight,
}: {
  box: SignatureBox
  containerWidth: number
  containerHeight: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: box.id,
  })

  const style = {
    position: 'absolute' as const,
    left: `${box.x}px`,
    top: `${box.y}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const bgColor = box.type === 'pemohon_digital'
    ? 'bg-blue-100 border-blue-400'
    : 'bg-gray-100 border-gray-400'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 border-dashed ${bgColor} rounded-lg flex flex-col items-center justify-center p-2 ${
        isDragging ? 'opacity-70 shadow-lg' : 'opacity-90 hover:opacity-100'
      } transition-opacity`}
      {...listeners}
      {...attributes}
    >
      <Move className="w-4 h-4 text-gray-600 mb-1" />
      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
        {box.label}
      </span>
      <span className="text-xs text-gray-500 mt-1">
        {box.type === 'pemohon_digital' ? 'Digital' : 'Placeholder'}
      </span>
    </div>
  )
}

export default function SignatureBoxPreview({
  signatureBoxes,
  documentTemplate,
  onUpdatePositions,
  onClose,
}: SignatureBoxPreviewProps) {
  const [localBoxes, setLocalBoxes] = useState(signatureBoxes)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        setContainerSize({
          width: containerRef.current?.offsetWidth || 0,
          height: containerRef.current?.offsetHeight || 0,
        })
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event

    setLocalBoxes((boxes) =>
      boxes.map((box) => {
        if (box.id === active.id) {
          // Calculate new position with boundaries
          let newX = box.x + delta.x
          let newY = box.y + delta.y

          // Prevent going outside container
          newX = Math.max(0, Math.min(newX, containerSize.width - box.width))
          newY = Math.max(0, Math.min(newY, containerSize.height - box.height))

          return { ...box, x: Math.round(newX), y: Math.round(newY) }
        }
        return box
      })
    )
  }

  const handleSave = () => {
    // Save positions with reference dimensions for scaling
    const boxesWithDimensions = localBoxes.map(box => ({
      ...box,
      referenceWidth: containerSize.width,
      referenceHeight: containerSize.height,
    }))
    onUpdatePositions(boxesWithDimensions)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Preview & Atur Posisi Tanda Tangan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag kotak tanda tangan untuk mengatur posisinya pada dokumen
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <DndContext onDragEnd={handleDragEnd}>
              <div
                ref={containerRef}
                className="relative bg-white shadow-lg border border-gray-300"
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: '12pt',
                    lineHeight: '1.6',
                    width: '794px', // A4 width at 96 DPI
                    minHeight: '1123px', // A4 height at 96 DPI
                    padding: '20mm',
                    boxSizing: 'border-box',
                  }}
              >
                {/* Document Content */}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: documentTemplate || '<p class="text-gray-400">Template dokumen kosong...</p>' }}
                />

                {/* Draggable Signature Boxes */}
                {localBoxes.map((box) => (
                  <DraggableSignatureBox
                    key={box.id}
                    box={box}
                    containerWidth={containerSize.width}
                    containerHeight={containerSize.height}
                  />
                ))}
              </div>
            </DndContext>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-dashed border-blue-400 rounded"></div>
              <span className="text-gray-700">TTD Digital (Pemohon)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded"></div>
              <span className="text-gray-700">Placeholder TTD (Pejabat)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button type="button" variant="primary" onClick={handleSave}>
              Simpan Posisi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
