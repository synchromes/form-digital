'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export interface SignatureBox {
  id: string
  label: string
  type: 'pemohon_digital' | 'pejabat_placeholder'
  pejabatId?: string
  pejabatNama?: string
  pejabatNip?: string
  x: number
  y: number
  width: number
  height: number
  // Reference dimensions for scaling when content changes
  referenceWidth?: number
  referenceHeight?: number
}

interface Pejabat {
  id: string
  nama: string
  nip: string
  jabatan: string
}

interface SignatureBoxEditorProps {
  signatureBoxes: SignatureBox[]
  pejabatList?: Pejabat[]
  onChange: (boxes: SignatureBox[]) => void
  onPreview?: () => void
}

export default function SignatureBoxEditor({
  signatureBoxes,
  pejabatList = [],
  onChange,
  onPreview
}: SignatureBoxEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SignatureBox>>({})

  const signatureTypes = [
    { value: 'pemohon_digital', label: 'Tanda Tangan Digital (Pemohon)' },
    { value: 'pejabat_placeholder', label: 'Placeholder TTD Manual (Pejabat)' },
  ]

  const pejabatOptions = [
    { value: '', label: 'Pilih Pejabat...' },
    { value: 'KETUA_TIM', label: 'Ketua Tim (dari form)' },
    ...pejabatList.map(p => ({
      value: p.id,
      label: `${p.nama} - NIP: ${p.nip}`
    }))
  ]

  const handlePejabatChange = (pejabatId: string) => {
    if (pejabatId === 'KETUA_TIM') {
      setEditForm({
        ...editForm,
        pejabatId: 'KETUA_TIM',
        pejabatNama: 'Ketua Tim',
        pejabatNip: '(Dari data tim)',
      })
    } else {
      const selectedPejabat = pejabatList.find(p => p.id === pejabatId)
      if (selectedPejabat) {
        setEditForm({
          ...editForm,
          pejabatId: selectedPejabat.id,
          pejabatNama: selectedPejabat.nama,
          pejabatNip: selectedPejabat.nip,
        })
      } else {
        setEditForm({
          ...editForm,
          pejabatId: undefined,
          pejabatNama: undefined,
          pejabatNip: undefined,
        })
      }
    }
  }

  const addSignatureBox = () => {
    const newBox: SignatureBox = {
      id: Math.random().toString(36).substring(7),
      label: 'Tanda Tangan Baru',
      type: 'pemohon_digital',
      x: 50,
      y: 50,
      width: 200,
      height: 80,
    }
    onChange([...signatureBoxes, newBox])
  }

  const removeSignatureBox = (id: string) => {
    onChange(signatureBoxes.filter((box) => box.id !== id))
  }

  const startEdit = (box: SignatureBox) => {
    setEditingId(box.id)
    setEditForm({ ...box })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = () => {
    if (editingId && editForm) {
      onChange(
        signatureBoxes.map((box) =>
          box.id === editingId ? { ...box, ...editForm } : box
        )
      )
      setEditingId(null)
      setEditForm({})
    }
  }

  const updateBox = (id: string, updates: Partial<SignatureBox>) => {
    onChange(
      signatureBoxes.map((box) =>
        box.id === id ? { ...box, ...updates } : box
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Kotak Tanda Tangan</h3>
          <p className="text-sm text-gray-600">
            Kelola posisi dan konfigurasi kotak tanda tangan pada dokumen
          </p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onPreview}
              disabled={signatureBoxes.length === 0}
            >
              Preview Posisi
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={addSignatureBox}
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah Kotak TTD
          </Button>
        </div>
      </div>

      {signatureBoxes.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Belum ada kotak tanda tangan</p>
          <Button type="button" variant="secondary" size="sm" onClick={addSignatureBox}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Kotak TTD
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {signatureBoxes.map((box, index) => (
            <div
              key={box.id}
              className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              {editingId === box.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Label Tanda Tangan"
                      value={editForm.label || ''}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      placeholder="Contoh: Pemohon, Ketua Tim"
                    />
                    <Select
                      label="Tipe Tanda Tangan"
                      options={signatureTypes}
                      value={editForm.type || 'pemohon_digital'}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    />
                  </div>
                  {editForm.type === 'pejabat_placeholder' && (
                    <div>
                      <Select
                        label="Pilih Pejabat"
                        options={pejabatOptions}
                        value={editForm.pejabatId || ''}
                        onChange={(e) => handlePejabatChange(e.target.value)}
                        helperText="Pilih pejabat yang akan menandatangani dokumen ini"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                      label="Posisi X (px)"
                      type="number"
                      value={editForm.x || 0}
                      onChange={(e) => setEditForm({ ...editForm, x: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      label="Posisi Y (px)"
                      type="number"
                      value={editForm.y || 0}
                      onChange={(e) => setEditForm({ ...editForm, y: parseInt(e.target.value) || 0 })}
                    />
                    <Input
                      label="Lebar (px)"
                      type="number"
                      value={editForm.width || 100}
                      onChange={(e) => setEditForm({ ...editForm, width: parseInt(e.target.value) || 100 })}
                    />
                    <Input
                      label="Tinggi (px)"
                      type="number"
                      value={editForm.height || 50}
                      onChange={(e) => setEditForm({ ...editForm, height: parseInt(e.target.value) || 50 })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="primary" size="sm" onClick={saveEdit}>
                      <Check className="w-4 h-4 mr-1" />
                      Simpan
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>
                      <X className="w-4 h-4 mr-1" />
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <h4 className="text-base font-semibold text-gray-900">{box.label}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          box.type === 'pemohon_digital'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {box.type === 'pemohon_digital' ? 'Digital' : 'Placeholder'}
                      </span>
                    </div>
                    {box.type === 'pejabat_placeholder' && box.pejabatNama && (
                      <div className="mb-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                        <span className="font-medium">Pejabat:</span> {box.pejabatNama} - NIP: {box.pejabatNip}
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">X:</span> {box.x}px
                      </div>
                      <div>
                        <span className="font-medium">Y:</span> {box.y}px
                      </div>
                      <div>
                        <span className="font-medium">Lebar:</span> {box.width}px
                      </div>
                      <div>
                        <span className="font-medium">Tinggi:</span> {box.height}px
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(box)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSignatureBox(box.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Gunakan tombol <strong>"Preview Posisi"</strong> untuk melihat dan mengatur posisi kotak tanda tangan secara visual dengan drag & drop. Posisi (X, Y) dihitung dari pojok kiri atas dokumen.
        </p>
      </div>
    </div>
  )
}
