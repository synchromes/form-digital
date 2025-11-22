'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import TextArea from '@/components/ui/TextArea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import SignatureCanvas from '@/components/SignatureCanvas'

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
  fields: FormField[]
}

export default function FormSubmissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [form, setForm] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({})
  const [timList, setTimList] = useState<any[]>([])

  useEffect(() => {
    fetchForm()
    fetchTimList()
  }, [])

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/${resolvedParams.slug}`)
      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        alert('Form tidak ditemukan')
        router.push('/form')
      }
    } catch (error) {
      alert('Gagal memuat form')
    }
  }

  const fetchTimList = async () => {
    try {
      const response = await fetch('/api/tim')
      if (response.ok) {
        const data = await response.json()
        setTimList(data)
      }
    } catch (error) {
      console.error('Error fetching tim:', error)
    }
  }

  const handleFileUpload = async (fieldId: string, file: File) => {
    setIsUploading({ ...isUploading, [fieldId]: true })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, [fieldId]: data.url }))
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal mengupload file')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengupload file')
    } finally {
      setIsUploading({ ...isUploading, [fieldId]: false })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    form?.fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = 'Field ini wajib diisi'
      }

      if (field.fieldType === 'EMAIL' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Format email tidak valid'
        }
      }

      if (field.fieldType === 'PHONE' && formData[field.id]) {
        const phoneRegex = /^[0-9+\-\s()]+$/
        if (!phoneRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Format nomor telepon tidak valid'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const submissionData = form?.fields.map((field) => ({
        fieldId: field.id,
        value: formData[field.id] || '',
      }))

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formTemplateId: form?.id,
          data: submissionData,
        }),
      })

      if (response.ok) {
        const submission = await response.json()
        router.push(`/form/success?id=${submission.id}`)
      } else {
        alert('Gagal mengirim formulir')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    switch (field.fieldType) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'WHATSAPP':
      case 'NUMBER':
        return (
          <Input
            key={field.id}
            type={field.fieldType === 'EMAIL' ? 'email' : field.fieldType === 'NUMBER' ? 'number' : field.fieldType === 'PHONE' || field.fieldType === 'WHATSAPP' ? 'tel' : 'text'}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={field.required}
            error={error}
          />
        )

      case 'TEXTAREA':
        return (
          <TextArea
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={field.required}
            error={error}
            rows={4}
          />
        )

      case 'SELECT':
        const options = field.options
          ? field.options.split('\n').filter(Boolean).map((opt) => ({
            value: opt.trim(),
            label: opt.trim(),
          }))
          : []

        return (
          <Select
            key={field.id}
            label={field.label}
            options={options}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={field.required}
            error={error}
          />
        )

      case 'TIM':
        const timOptions = timList.map((tim) => ({
          value: tim.id,
          label: `${tim.namaTim} - ${tim.ketuaTim.nama}`,
        }))

        return (
          <Select
            key={field.id}
            label={field.label}
            options={timOptions}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={field.required}
            error={error}
          />
        )

      case 'DATE':
        const today = new Date().toISOString().split('T')[0]
        return (
          <Input
            key={field.id}
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            required={field.required}
            error={error}
            min={field.allowPastDates === false ? today : undefined}
          />
        )

      case 'FILE':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(field.id, file)
              }}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none px-4 py-2.5"
              disabled={isUploading[field.id]}
            />
            <p className="text-xs text-gray-500">
              Format: PDF, JPG, PNG | Maksimal: 10MB
            </p>
            {isUploading[field.id] && (
              <p className="text-sm text-blue-600">Mengupload...</p>
            )}
            {value && (
              <p className="text-sm text-green-600">✓ File berhasil diupload</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      case 'SIGNATURE':
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <SignatureCanvas
              value={value}
              onChange={(signature) => setFormData({ ...formData, [field.id]: signature })}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-xl md:text-2xl font-bold text-blue-600">TVRI</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-blue-100 text-sm md:text-base">{form.description}</p>
          )}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Silakan lengkapi data diri Anda terlebih dahulu
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {form.fields.map((field) => renderField(field))}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto"
                >
                  Kembali
                </Button>
                <Button type="submit" isLoading={isLoading} className="w-full sm:flex-1">
                  Kirim Pengajuan
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 md:mt-8">
          <p className="text-blue-100 text-sm">
            &copy; 2025 TVRI Kalimantan Barat
          </p>
        </div>
      </div>
    </div>
  )
}
