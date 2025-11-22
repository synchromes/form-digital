'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import TextArea from '@/components/ui/TextArea'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Printer, CheckCircle, XCircle, X, FileDown } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { generatePDF, replaceVariables } from '@/lib/pdfGenerator'
import PDFPreviewModal from '@/components/PDFPreviewModal'

interface SubmissionData {
  id: string
  field: {
    label: string
    fieldType: string
  }
  value: string
}

interface Submission {
  id: string
  status: string
  rejectionReason?: string
  submittedAt: string
  snapshotTemplate?: string | null
  snapshotSignatureBoxes?: string | null
  formTemplate: {
    title: string
    description: string
    documentTemplate?: string | null
    signatureBoxes?: string | null
    fields: Array<{
      id: string
      label: string
      fieldType: string
    }>
  }
  data: SubmissionData[]
  timData?: {
    namaTim: string
    ketuaTim: {
      nama: string
      nip: string
      jabatan: string
    }
  } | null
}

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const toast = useToast()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSubmission()
  }, [])

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
      } else {
        toast.error('Pengajuan tidak ditemukan')
        router.push('/admin/submissions')
      }
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/submissions/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (response.ok) {
        toast.success('Pengajuan berhasil disetujui!')
        fetchSubmission()
      } else {
        toast.error('Gagal menyetujui pengajuan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyetujui')
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Alasan penolakan wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/submissions/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectionReason.trim()
        }),
      })

      if (response.ok) {
        toast.success('Pengajuan berhasil ditolak!')
        setShowRejectModal(false)
        setRejectionReason('')
        fetchSubmission()
      } else {
        toast.error('Gagal menolak pengajuan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menolak')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGeneratePDF = async () => {
    if (!submission) return

    // Use snapshot if available, otherwise fallback to current template
    const documentTemplate = submission.snapshotTemplate || submission.formTemplate.documentTemplate
    const signatureBoxesConfig = submission.snapshotSignatureBoxes || submission.formTemplate.signatureBoxes

    // Check if document template exists
    if (!documentTemplate) {
      toast.warning('Template dokumen belum dibuat untuk form ini')
      return
    }

    setIsGeneratingPDF(true)
    try {
      // Parse signature boxes
      let signatureBoxes = []
      if (signatureBoxesConfig) {
        try {
          signatureBoxes = JSON.parse(signatureBoxesConfig)
        } catch (e) {
          console.error('Failed to parse signature boxes:', e)
        }
      }

      // Prepare submission data for PDF
      const submissionData = submission.data.map(d => ({
        fieldId: d.field.id || d.id,
        value: d.value
      }))

      // Generate PDF
      const generatedPdfBlob = await generatePDF(
        documentTemplate,
        signatureBoxes,
        submissionData,
        submission.formTemplate.fields,
        submission.id,
        submission.timData
      )

      // Set PDF blob and show preview modal
      const fileName = `${submission.formTemplate.title.replace(/\s+/g, '_')}_${submission.id.substring(0, 8)}.pdf`
      setPdfBlob(generatedPdfBlob)
      setPdfFileName(fileName)
      setShowPDFPreview(true)

      // toast.success('PDF berhasil di-generate!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Gagal generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const renderValue = (data: SubmissionData) => {
    if (data.field.fieldType === 'SIGNATURE') {
      return (
        <div className="border border-gray-200 rounded-lg p-2 inline-block">
          <img src={data.value} alt="Signature" className="max-w-[200px] h-auto" />
        </div>
      )
    }

    if (data.field.fieldType === 'FILE') {
      return (
        <a
          href={data.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Lihat File
        </a>
      )
    }

    if (data.field.fieldType === 'DATE') {
      // Format: "18 November 2025" (without time)
      const d = new Date(data.value)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    if (data.field.fieldType === 'TIM') {
      return submission?.timData?.namaTim || data.value
    }

    return data.value
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!submission) {
    return null
  }

  return (
    <div>
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tolak Pengajuan</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Harap berikan alasan penolakan yang jelas kepada pemohon.
              </p>
              <TextArea
                label="Alasan Penolakan"
                placeholder="Contoh: Dokumen pendukung tidak lengkap. Harap melampirkan surat keterangan dari atasan langsung."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={isSubmitting}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tolak Pengajuan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons - hidden on print */}
      <div className="no-print mb-6 flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <div className="flex gap-2 ml-auto">
          {submission.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleApprove}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Setujui
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Tolak
              </Button>
            </>
          )}
          {/* <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Cetak
          </Button> */}
          {submission.formTemplate.documentTemplate && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePDF}
              isLoading={isGeneratingPDF}
            >
              <FileDown className="w-4 h-4 mr-1" />
              Preview PDF
            </Button>
          )}
        </div>
      </div>

      {/* Printable Letter */}
      <div ref={printRef} className="bg-white">
        {/* Letterhead */}
        <div className="border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">TVRI</span>
            </div>
            <div className="flex-1">
              <h1 align="center" className="text-2xl font-bold text-gray-900">
                TVRI KALIMANTAN BARAT
              </h1>
              <p align="center" className="text-sm text-gray-600">
                Jl. Jenderal Ahmad Yani No. 60
              </p>
              <p align="center" className="text-sm text-gray-600">
                Pontianak Selatan, Kota Pontianak 78124
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 uppercase mb-2">
              {submission.formTemplate.title}
            </h2>
            <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Submission Info */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">No. Pengajuan:</span>
                <p className="text-gray-900">{submission.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                <p className="text-gray-900">{formatDateTime(submission.submittedAt)}</p>
              </div>
            </div>
          </div>

          {/* Form Data */}
          <div className="space-y-6 mb-12">
            {submission.data.map((data) => (
              <div key={data.id} className="border-b border-gray-200 pb-4">
                <dt className="text-sm font-medium text-gray-700 mb-2">
                  {data.field.label}
                </dt>
                <dd className="text-base text-gray-900">{renderValue(data)}</dd>
              </div>
            ))}
          </div>

          {/* Status Badge - only visible on screen */}
          <div className="no-print mb-8">
            <span
              className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${submission.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : submission.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
                }`}
            >
              {submission.status === 'approved'
                ? 'Disetujui'
                : submission.status === 'rejected'
                  ? 'Ditolak'
                  : 'Menunggu Persetujuan'}
            </span>

            {/* Show rejection reason if rejected */}
            {submission.status === 'rejected' && submission.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Alasan Penolakan:
                </p>
                <p className="text-sm text-red-700">
                  {submission.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 pb-8 px-8 mt-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mt-2">
              &copy; 2025 SDM LPP TVRI Kalimanatan Barat - Sistem Pengajuan Surat Digital
            </p>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        pdfBlob={pdfBlob}
        fileName={pdfFileName}
        onClose={() => {
          setShowPDFPreview(false)
          setPdfBlob(null)
          setPdfFileName('')
        }}
      />
    </div>
  )
}
