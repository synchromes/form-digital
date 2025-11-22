'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Plus, Eye, Edit, Trash2, FileText, X, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface FormTemplate {
  id: string
  title: string
  description: string
  slug: string
  isActive: boolean
  createdAt: string
  _count: {
    submissions: number
  }
}

export default function FormsPage() {
  const toast = useToast()
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<FormTemplate | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms/all')
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      }
    } catch (error) {
      console.error('Error fetching forms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openDeleteModal = (form: FormTemplate) => {
    setFormToDelete(form)
    setShowDeleteModal(true)
    setDeleteConfirmation('')
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setFormToDelete(null)
    setDeleteConfirmation('')
  }

  const handleDelete = async () => {
    if (!formToDelete) return

    if (deleteConfirmation !== formToDelete.title) {
      toast.warning('Konfirmasi tidak sesuai. Ketik nama form dengan benar.')
      return
    }

    setDeletingId(formToDelete.id)
    try {
      const response = await fetch(`/api/forms/id/${formToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setForms(forms.filter(f => f.id !== formToDelete.id))
        toast.success('Form berhasil dihapus!')
        closeDeleteModal()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus form')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus form')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kelola Form</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Buat dan kelola form pengajuan surat</p>
        </div>
        <Link href="/admin/forms/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Buat Form Baru
          </Button>
        </Link>
      </div>

      {/* Content */}
      {forms.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum ada form
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat form pengajuan surat pertama Anda
              </p>
              <Link href="/admin/forms/create" className="inline-block">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Form Baru
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {form.title}
                    </h3>
                    {form.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
                      form.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {form.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-900">{form._count.submissions}</span> pengajuan
                  </span>
                  <span className="text-gray-500 text-xs">{formatDateTime(form.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link href={`/form/${form.slug}`} target="_blank" className="col-span-1">
                    <Button variant="secondary" size="sm" className="w-full" title="Lihat Form">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/edit`} className="col-span-1">
                    <Button variant="secondary" size="sm" className="w-full" title="Edit Form">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    className="col-span-1"
                    title="Hapus Form"
                    onClick={() => openDeleteModal(form)}
                    disabled={deletingId === form.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && formToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Hapus Form</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  ⚠️ Peringatan: Tindakan ini tidak dapat dibatalkan!
                </p>
                <p className="text-sm text-red-700">
                  Menghapus form akan menghapus <strong>semua data pengajuan</strong> yang terkait dengan form ini.
                  {formToDelete._count.submissions > 0 && (
                    <span className="block mt-1">
                      Terdapat <strong>{formToDelete._count.submissions} pengajuan</strong> yang akan dihapus.
                    </span>
                  )}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Form yang akan dihapus:
                </p>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">{formToDelete.title}</p>
                  {formToDelete.description && (
                    <p className="text-sm text-gray-600 mt-1">{formToDelete.description}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Untuk konfirmasi, ketik nama form: <span className="text-red-600 font-semibold">{formToDelete.title}</span>
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`Ketik "${formToDelete.title}" untuk konfirmasi`}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={closeDeleteModal}
                className="flex-1"
                disabled={deletingId !== null}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
                disabled={deleteConfirmation !== formToDelete.title || deletingId !== null}
                isLoading={deletingId === formToDelete.id}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Form
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
