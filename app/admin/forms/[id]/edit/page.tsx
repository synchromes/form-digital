'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Plus, Trash2, GripVertical, ArrowLeft, Settings, List, FileText, MessageCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import RichTextEditor from '@/components/RichTextEditor'
import VariablePicker from '@/components/VariablePicker'
import SignatureBoxEditor, { SignatureBox } from '@/components/SignatureBoxEditor'
import SignatureBoxPreview from '@/components/SignatureBoxPreview'

interface FormField {
  id: string
  label: string
  fieldType: string
  placeholder: string
  required: boolean
  options: string
  allowPastDates?: boolean
  order: number
}

interface FormTemplate {
  id: string
  title: string
  description: string
  slug: string
  isActive: boolean
  documentTemplate: string | null
  signatureBoxes: string | null
  fields: FormField[]
}

const fieldTypes = [
  { value: 'TEXT', label: 'Teks' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Nomor Telepon' },
  { value: 'WHATSAPP', label: 'WhatsApp (Notifikasi)' },
  { value: 'TIM', label: 'Pilih Tim' },
  { value: 'NUMBER', label: 'Angka' },
  { value: 'TEXTAREA', label: 'Area Teks' },
  { value: 'SELECT', label: 'Pilihan Dropdown' },
  { value: 'DATE', label: 'Tanggal' },
  { value: 'FILE', label: 'Upload File' },
  { value: 'SIGNATURE', label: 'Tanda Tangan Digital' },
]

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'fields' | 'template'>('basic')
  const [form, setForm] = useState<FormTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [fields, setFields] = useState<FormField[]>([])
  const [documentTemplate, setDocumentTemplate] = useState('')
  const [signatureBoxes, setSignatureBoxes] = useState<SignatureBox[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isWhatsAppActive, setIsWhatsAppActive] = useState(false)
  const [pejabatList, setPejabatList] = useState<any[]>([])

  useEffect(() => {
    fetchForm()
    checkWhatsAppStatus()
    fetchPejabatList()
  }, [])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/id/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
        setTitle(data.title)
        setDescription(data.description || '')
        setSlug(data.slug)
        setIsActive(data.isActive)
        setDocumentTemplate(data.documentTemplate || '')
        // Parse signatureBoxes from JSON string
        if (data.signatureBoxes) {
          try {
            setSignatureBoxes(JSON.parse(data.signatureBoxes))
          } catch (e) {
            setSignatureBoxes([])
          }
        }
        // Ensure all field values are strings (not null)
        setFields(data.fields.map((field: any) => ({
          ...field,
          placeholder: field.placeholder || '',
          options: field.options || '',
          allowPastDates: field.allowPastDates ?? true,
        })))
      } else {
        toast.error('Form tidak ditemukan')
        router.push('/admin/forms')
      }
    } catch (error) {
      toast.error('Gagal memuat form')
    } finally {
      setIsLoading(false)
    }
  }

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/config')
      if (response.ok) {
        const config = await response.json()
        setIsWhatsAppActive(config.isActive)
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
    }
  }

  const fetchPejabatList = async () => {
    try {
      const response = await fetch('/api/pejabat')
      if (response.ok) {
        const data = await response.json()
        setPejabatList(data)
      }
    } catch (error) {
      console.error('Error fetching pejabat:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value))
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(7),
      label: '',
      fieldType: 'TEXT',
      placeholder: '',
      required: false,
      options: '',
      allowPastDates: true,
      order: fields.length,
    }
    setFields([...fields, newField])
  }

  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(fields.map((field) =>
      field.id === id ? { ...field, [key]: value } : field
    ))
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const hasWhatsAppField = () => {
    return fields.some(field => field.fieldType === 'WHATSAPP')
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
      newFields.forEach((field, i) => field.order = i)
      setFields(newFields)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/forms/id/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          slug,
          isActive,
          documentTemplate,
          signatureBoxes: JSON.stringify(signatureBoxes),
          fields: fields.map(({ id, ...field }) => ({
            ...field,
            // Keep the original ID if it's a UUID (existing field), otherwise it's new
            ...(id.length > 10 ? { id } : {}),
          })),
        }),
      })

      if (response.ok) {
        toast.success('Form berhasil diupdate!')
        router.push('/admin/forms')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal mengupdate form')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'basic' as const, label: 'Informasi Dasar', icon: Settings },
    { id: 'fields' as const, label: 'Field Form', icon: List },
    { id: 'template' as const, label: 'Template Dokumen', icon: FileText },
  ]

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

  if (!form) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Form</h1>
          <p className="text-gray-600">
            Ubah informasi dan konfigurasi form
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-4 border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab: Informasi Dasar */}
        {activeTab === 'basic' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Informasi Dasar Form</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Judul Form"
                placeholder="Contoh: Pengajuan Reset HP"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <Input
                label="Slug (URL)"
                placeholder="pengajuan-reset-hp"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                helperText="URL unik untuk form ini"
                required
              />

              <TextArea
                label="Deskripsi"
                placeholder="Deskripsi singkat tentang form ini"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Form aktif (dapat diakses oleh pegawai)
                  </span>
                </label>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Tab: Field Form */}
        {activeTab === 'fields' && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Field Form</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addField}>
                <Plus className="w-4 h-4 mr-1" />
                Tambah Field
              </Button>
            </CardHeader>
            <CardBody>
              {isWhatsAppActive && !hasWhatsAppField() && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 mb-1">
                        Notifikasi WhatsApp Aktif
                      </p>
                      <p className="text-sm text-yellow-700">
                        Notifikasi WhatsApp sedang aktif, tapi form ini belum memiliki field WhatsApp.
                        Tambahkan field dengan tipe <strong>"WhatsApp (Notifikasi)"</strong> agar submitter bisa menerima notifikasi otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {fields.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Belum ada field</p>
                  <Button type="button" variant="secondary" onClick={addField}>
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Field
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-1 pt-8">
                          <button
                            type="button"
                            onClick={() => moveField(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => moveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              label="Label Field"
                              placeholder="Nama Lengkap"
                              value={field.label}
                              onChange={(e) => updateField(field.id, 'label', e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Select
                              label="Tipe Field"
                              options={fieldTypes}
                              value={field.fieldType}
                              onChange={(e) => updateField(field.id, 'fieldType', e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Input
                              label="Placeholder"
                              placeholder="Masukkan nama lengkap..."
                              value={field.placeholder}
                              onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                            />
                          </div>

                          {field.fieldType === 'SELECT' && (
                            <TextArea
                              label="Opsi (satu per baris)"
                              placeholder="Opsi 1&#10;Opsi 2&#10;Opsi 3"
                              value={field.options}
                              onChange={(e) => updateField(field.id, 'options', e.target.value)}
                              rows={3}
                            />
                          )}

                          <div className="flex items-center">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Wajib diisi</span>
                            </label>
                          </div>

                          {field.fieldType === 'DATE' && (
                            <div className="flex items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.allowPastDates ?? true}
                                  onChange={(e) => updateField(field.id, 'allowPastDates', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Izinkan Tanggal Masa Lalu</span>
                              </label>
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Tab: Template Dokumen */}
        {activeTab === 'template' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Template Dokumen</h2>
                <VariablePicker
                  fields={fields}
                  onSelect={(variable) => {
                    setDocumentTemplate(documentTemplate + variable)
                  }}
                />
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Petunjuk:</strong> Buat template dokumen surat dengan rich text editor.
                  Gunakan button <strong>"Insert Variable"</strong> untuk menambahkan variable yang akan diganti dengan data real saat generate PDF.
                </p>
              </div>

              <RichTextEditor
                content={documentTemplate}
                onChange={setDocumentTemplate}
                placeholder="Ketik template dokumen di sini..."
              />

              <div className="border-t border-gray-200 pt-6 mt-6">
                <SignatureBoxEditor
                  signatureBoxes={signatureBoxes}
                  pejabatList={pejabatList}
                  onChange={setSignatureBoxes}
                  onPreview={() => setShowPreview(true)}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Signature Box Preview Modal */}
        {showPreview && (
          <SignatureBoxPreview
            signatureBoxes={signatureBoxes}
            documentTemplate={documentTemplate}
            onUpdatePositions={setSignatureBoxes}
            onClose={() => setShowPreview(false)}
          />
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  )
}
