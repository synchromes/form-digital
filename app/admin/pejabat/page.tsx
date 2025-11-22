'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Plus, Edit, Trash2, Users, X } from 'lucide-react'

interface Pejabat {
  id: string
  nama: string
  nip: string
  jabatan: string
  isActive: boolean
  _count?: {
    timDipimpin: number
  }
}

export default function PejabatPage() {
  const toast = useToast()
  const [pejabat, setPejabat] = useState<Pejabat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPejabat, setEditingPejabat] = useState<Pejabat | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    jabatan: '',
  })

  useEffect(() => {
    fetchPejabat()
  }, [])

  const fetchPejabat = async () => {
    try {
      const response = await fetch('/api/pejabat')
      if (response.ok) {
        const data = await response.json()
        setPejabat(data)
      }
    } catch (error) {
      console.error('Error fetching pejabat:', error)
      toast.error('Gagal memuat data pejabat')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingPejabat(null)
    setFormData({ nama: '', nip: '', jabatan: '' })
    setShowModal(true)
  }

  const openEditModal = (p: Pejabat) => {
    setEditingPejabat(p)
    setFormData({
      nama: p.nama,
      nip: p.nip,
      jabatan: p.jabatan,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPejabat(null)
    setFormData({ nama: '', nip: '', jabatan: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingPejabat
        ? `/api/pejabat/${editingPejabat.id}`
        : '/api/pejabat'

      const method = editingPejabat ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingPejabat
            ? 'Pejabat berhasil diupdate'
            : 'Pejabat berhasil ditambahkan'
        )
        closeModal()
        fetchPejabat()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan pejabat')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pejabat "${nama}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/pejabat/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Pejabat berhasil dihapus')
        fetchPejabat()
      } else {
        toast.error('Gagal menghapus pejabat')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pejabat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Pejabat</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola data pejabat dan ketua tim
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pejabat
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {pejabat.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada data pejabat
              </h3>
              <p className="text-gray-600 mb-6">
                Tambahkan pejabat pertama Anda
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pejabat
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jabatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tim Dipimpin
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pejabat.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{p.nama}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{p.nip}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{p.jabatan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {p._count?.timDipimpin || 0} Tim
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(p)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(p.id, p.nama)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingPejabat ? 'Edit Pejabat' : 'Tambah Pejabat'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nama Lengkap"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Sugeng Widiyanto"
                required
              />

              <Input
                label="NIP"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                placeholder="Contoh: 198501152010011002"
                required
              />

              <Input
                label="Jabatan"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                placeholder="Contoh: Ketua Tim Keuangan"
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSaving}
                  isLoading={isSaving}
                >
                  {editingPejabat ? 'Update' : 'Tambah'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
