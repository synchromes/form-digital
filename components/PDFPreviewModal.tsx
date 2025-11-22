'use client'

import { X, Download } from 'lucide-react'
import Button from './ui/Button'

interface PDFPreviewModalProps {
  isOpen: boolean
  pdfBlob: Blob | null
  fileName: string
  onClose: () => void
}

export default function PDFPreviewModal({
  isOpen,
  pdfBlob,
  fileName,
  onClose,
}: PDFPreviewModalProps) {
  if (!isOpen || !pdfBlob) return null

  const pdfUrl = URL.createObjectURL(pdfBlob)

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClose = () => {
    URL.revokeObjectURL(pdfUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Preview PDF</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-hidden p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-full border border-gray-300 rounded-lg"
            title="PDF Preview"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Preview PDF sebelum mengunduh. Pastikan semua data sudah benar.
          </p>
        </div>
      </div>
    </div>
  )
}
