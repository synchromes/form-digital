'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Search, ArrowLeft, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

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
  formTemplate: {
    title: string
    description: string
  }
  data: SubmissionData[]
  timData?: {
    namaTim: string
  } | null
}

export default function CheckStatusPage() {
  const [submissionId, setSubmissionId] = useState('')
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmission(null)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/submissions/check/${submissionId}`)
      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
      } else {
        setError('Pengajuan tidak ditemukan. Pastikan ID surat sudah benar.')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Disetujui',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        }
      case 'rejected':
        return {
          label: 'Ditolak',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
        }
      default:
        return {
          label: 'Sedang Diproses',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Clock,
          iconColor: 'text-yellow-600',
        }
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
          className="text-blue-600 hover:underline inline-flex items-center"
        >
          <FileText className="w-4 h-4 mr-1" />
          Lihat Dokumen
        </a>
      )
    }

    if (data.field.fieldType === 'DATE') {
      return formatDateTime(data.value)
    }

    if (data.field.fieldType === 'TIM') {
      return submission?.timData?.namaTim || data.value
    }

    return data.value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-blue-600">TVRI</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Cek Status Surat
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Masukkan ID surat untuk melihat status pengajuan Anda
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardBody>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Input
                  label="ID Surat"
                  placeholder="Masukkan ID surat (contoh: cm3abc123def...)"
                  value={submissionId}
                  onChange={(e) => setSubmissionId(e.target.value)}
                  required
                  helperText="ID surat dapat ditemukan di email konfirmasi atau halaman sukses setelah submit"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Cek Status
                </Button>
                <Link href="/">
                  <Button type="button" variant="secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Result */}
        {submission && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {submission.formTemplate.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: {submission.id}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-center py-6">
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 ${getStatusInfo(submission.status).color}`}>
                  {(() => {
                    const StatusIcon = getStatusInfo(submission.status).icon
                    return <StatusIcon className={`w-8 h-8 ${getStatusInfo(submission.status).iconColor}`} />
                  })()}
                  <div>
                    <p className="text-sm font-medium">Status Pengajuan</p>
                    <p className="text-2xl font-bold">
                      {getStatusInfo(submission.status).label}
                    </p>
                    
                    {submission.status === 'rejected' && (
                      <p className="text-sm font-medium">Alasan: {submission.rejectionReason || '-'}</p>
                  )}
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Tanggal Pengajuan:</span>
                    <p className="text-gray-900">{formatDateTime(submission.submittedAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Jenis Surat:</span>
                    <p className="text-gray-900">{submission.formTemplate.title}</p>
                  </div>
                </div>
              </div>

              {/* Data Detail */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pengajuan</h3>
                <div className="space-y-4">
                  {submission.data.map((data) => (
                    <div key={data.id} className="border-b border-gray-200 pb-3 last:border-0">
                      <dt className="text-sm font-medium text-gray-700 mb-1">
                        {data.field.label}
                      </dt>
                      <dd className="text-base text-gray-900">{renderValue(data)}</dd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {submission.status === 'approved' && (
                    <>✓ Pengajuan Anda telah disetujui. Silakan hubungi bagian SDM untuk proses selanjutnya.</>
                  )}
                  {submission.status === 'rejected' && (
                    <>✗ Pengajuan Anda ditolak. Anda bisa membuat surat pengajuan kembali.</>
                  )}
                  {submission.status === 'pending' && (
                    <>⏳ Pengajuan Anda sedang dalam proses review. Harap menunggu konfirmasi lebih lanjut.</>
                  )}
                </p>
              </div>

              {/* Rejection Reason */}
              {/* {submission.status === 'rejected' && submission.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    Alasan Penolakan:
                  </p>
                  <p className="text-sm text-red-700">
                    {submission.rejectionReason}
                  </p>
                </div>
              )} */}
            </CardBody>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            &copy; 2025 SDM LPP TVRI Kalimantan Barat
          </p>
        </div>
      </div>
    </div>
  )
}
