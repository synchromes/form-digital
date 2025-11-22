'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import { Plus, Edit, Trash2, Users, X } from 'lucide-react'

interface Pejabat {
  id: string
  nama: string
  nip: string
  jabatan: string
}

interface Tim {
  id: string
  namaTim: string
  ketuaTimId: string
  isActive: boolean
  ketuaTim: Pejabat
  _count?: {
    forms: number
  }
}

export default function TimPage() {
  const toast = useToast()
  const [tim, setTim] = useState<Tim[]>([])
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTim, setEditingTim] = useState<Tim | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    namaTim: '',
    ketuaTimId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [timResponse, pejabatResponse] = await Promise.all([
        fetch('/api/tim'),
        fetch('/api/pejabat'),
      ])

      if (timResponse.ok) {
        const timData = await timResponse.json()
        setTim(timData)
      }

      if (pejabatResponse.ok) {
        const pejabatData = await pejabatResponse.json()
        setPejabatList(pejabatData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTim(null)
    setFormData({ namaTim: '', ketuaTimId: '' })
    setShowModal(true)
  }

  const openEditModal = (t: Tim) => {
    setEditingTim(t)
    setFormData({
      namaTim: t.namaTim,
      ketuaTimId: t.ketuaTimId,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTim(null)
    setFormData({ namaTim: '', ketuaTimId: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingTim ? `/api/tim/${editingTim.id}` : '/api/tim'
      const method = editingTim ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingTim ? 'Tim berhasil diupdate' : 'Tim berhasil ditambahkan'
        )
        closeModal()
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menyimpan tim')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string, namaTim: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus tim "${namaTim}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/tim/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tim berhasil dihapus')
        fetchData()
      } else {
        toast.error('Gagal menghapus tim')
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
          <p className="text-gray-600">Memuat data tim...</p>
        </div>
      </div>
    )
  }

  const pejabatOptions = pejabatList.map((p) => ({
    value: p.id,
    label: `${p.nama} - ${p.jabatan}`,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Data Tim</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Kelola data tim dan ketua tim
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tim
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {tim.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada data tim
              </h3>
              <p className="text-gray-600 mb-6">
                Tambahkan tim pertama Anda
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tim
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Tim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ketua Tim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIP Ketua
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Form
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tim.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {t.namaTim}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{t.ketuaTim.nama}</div>
                        <div className="text-xs text-gray-500">{t.ketuaTim.jabatan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{t.ketuaTim.nip}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {t._count?.forms || 0} Form
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(t)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(t.id, t.namaTim)}
                            disabled={deletingId === t.id}
                          >
                            {deletingId === t.id ? (
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
                {editingTim ? 'Edit Tim' : 'Tambah Tim'}
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
                label="Nama Tim"
                value={formData.namaTim}
                onChange={(e) =>
                  setFormData({ ...formData, namaTim: e.target.value })
                }
                placeholder="Contoh: Tim Keuangan"
                required
              />

              <Select
                label="Ketua Tim"
                options={pejabatOptions}
                value={formData.ketuaTimId}
                onChange={(e) =>
                  setFormData({ ...formData, ketuaTimId: e.target.value })
                }
                required
              />

              {pejabatList.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Belum ada data pejabat. Silakan tambahkan pejabat terlebih dahulu.
                  </p>
                </div>
              )}

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
                  disabled={isSaving || pejabatList.length === 0}
                  isLoading={isSaving}
                >
                  {editingTim ? 'Update' : 'Tambah'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
