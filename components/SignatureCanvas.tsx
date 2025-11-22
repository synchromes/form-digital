'use client'

import { useRef, useState } from 'react'
import SignatureCanvasLib from 'react-signature-canvas'
import Button from './ui/Button'

interface SignatureCanvasProps {
  onChange: (signature: string) => void
  value?: string
}

export default function SignatureCanvas({ onChange, value }: SignatureCanvasProps) {
  const sigCanvas = useRef<SignatureCanvasLib>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
    onChange('')
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png')
      onChange(dataURL)
      setIsEmpty(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
        <SignatureCanvasLib
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair',
          }}
          onEnd={save}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Gambar tanda tangan Anda di area putih di atas
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={isEmpty}
        >
          Hapus
        </Button>
      </div>
    </div>
  )
}
