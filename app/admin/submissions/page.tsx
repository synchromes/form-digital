'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Eye, Calendar, User, FileText, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
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
  submittedAt: string
  formTemplate: {
    id: string
    title: string
    description: string
  }
  data: SubmissionData[]
}

interface FormTemplate {
  id: string
  title: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all')
  const [formTypeFilter, setFormTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSubmissions, setTotalSubmissions] = useState(0)

  useEffect(() => {
    fetchFormTemplates()
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [currentPage, pageSize, statusFilter, formTypeFilter, searchQuery])

  const fetchFormTemplates = async () => {
    try {
      const response = await fetch('/api/forms')
      if (response.ok) {
        const data = await response.json()
        setFormTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching form templates:', error)
    }
  }

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        status: statusFilter,
        formTemplateId: formTypeFilter,
        search: searchQuery,
      })

      const response = await fetch(`/api/submissions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
        setTotalPages(data.pagination.totalPages)
        setTotalSubmissions(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubmitterName = (submission: Submission) => {
    const nameField = submission.data.find((d: any) =>
      d.field.label.toLowerCase().includes('nama')
    )
    return nameField?.value || 'Tidak diketahui'
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'status') {
      setStatusFilter(value)
    } else if (type === 'formType') {
      setFormTypeFilter(value)
    }
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Pengajuan</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Lihat dan kelola semua pengajuan surat</p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="space-y-5">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pencarian
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan nama pemohon atau ID surat..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Filter Row */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter & Tampilan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Status Pengajuan
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✓ Disetujui</option>
                  <option value="rejected">✗ Ditolak</option>
                </select>
              </div>

              {/* Form Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Jenis Surat
                </label>
                <select
                  value={formTypeFilter}
                  onChange={(e) => handleFilterChange('formType', e.target.value)}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="all">Semua Jenis</option>
                  {formTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Tampilkan Per Halaman
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="block w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="5">5 item</option>
                  <option value="10">10 item</option>
                  <option value="20">20 item</option>
                  <option value="50">50 item</option>
                </select>
              </div>

              {/* Reset Filters */}
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('all')
                    setFormTypeFilter('all')
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  className="w-full h-[42px]"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardBody className="py-16">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Memuat data pengajuan...</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Results Info */}
          <Card>
            <CardBody className="py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    Menampilkan {submissions.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} - {Math.min(currentPage * pageSize, totalSubmissions)} dari {totalSubmissions} pengajuan
                  </span>
                </div>
                <div className="text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </div>
              </div>
            </CardBody>
          </Card>

          {submissions.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardBody className="text-center py-20">
                <div className="max-w-sm mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <FileText className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {searchQuery || statusFilter !== 'all' || formTypeFilter !== 'all'
                      ? 'Tidak ada hasil ditemukan'
                      : 'Belum ada pengajuan'}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {searchQuery || statusFilter !== 'all' || formTypeFilter !== 'all'
                      ? 'Coba ubah filter atau kata kunci pencarian untuk melihat hasil yang berbeda'
                      : 'Pengajuan surat akan muncul di sini setelah user mengisi dan mengirimkan form'}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-lg hover:border-blue-200 transition-all duration-200 border border-gray-200">
                    <CardBody className="p-5 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        {/* Left side - Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">
                                {submission.formTemplate.title}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                  </div>
                                  <span className="truncate font-medium">{getSubmitterName(submission)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                  </div>
                                  <span>{formatDateTime(submission.submittedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                          <span
                            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap shadow-sm ${
                              submission.status === 'approved'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : submission.status === 'rejected'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}
                          >
                            {submission.status === 'approved'
                              ? '✓ Disetujui'
                              : submission.status === 'rejected'
                              ? '✗ Ditolak'
                              : '⏳ Pending'}
                          </span>

                          <Link href={`/admin/submissions/${submission.id}`} className="flex-shrink-0">
                            <Button variant="secondary" size="sm" className="whitespace-nowrap shadow-sm">
                              <Eye className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Lihat Detail</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="shadow-sm">
                  <CardBody className="py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                          Halaman {currentPage} / {totalPages}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="min-w-[110px]"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Sebelumnya
                        </Button>

                        {/* Page Numbers */}
                        <div className="hidden sm:flex gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = i + 1
                            } else if (currentPage <= 3) {
                              pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i
                            } else {
                              pageNum = currentPage - 2 + i
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="min-w-[110px]"
                        >
                          Selanjutnya
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
