'use client'

import { useState } from 'react'
import { ChevronDown, Copy, Check } from 'lucide-react'

interface Variable {
  id: string
  label: string
  variable: string
  category: string
  description?: string
}

interface FormField {
  id: string
  label: string
  fieldType: string
}

interface VariablePickerProps {
  onSelect?: (variable: string) => void
  fields?: FormField[]
}

export default function VariablePicker({ onSelect, fields = [] }: VariablePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  // Generate slug from label
  const generateSlug = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '')
  }

  // Build dynamic variables from form fields
  const buildVariables = (): Variable[] => {
    const variables: Variable[] = [
      // Data Sistem
      { id: 'tanggal_surat', label: 'Tanggal Surat', variable: '{{tanggal_surat}}', category: 'Sistem', description: 'Auto: Pontianak, [tanggal submit]' },
      { id: 'id_surat', label: 'ID Surat', variable: '{{id_surat}}', category: 'Sistem', description: 'ID submission' },
    ]

    // Add variables from form fields (Data Pemohon)
    fields.forEach(field => {
      // Skip TIM field type as it's special
      if (field.fieldType === 'TIM') {
        // Add Tim-related variables
        variables.push(
          { id: 'tim_nama', label: 'Nama Tim', variable: '{{tim_nama}}', category: 'Data Tim', description: 'Nama tim yang dipilih' },
          { id: 'ketua_tim_nama', label: 'Nama Ketua Tim', variable: '{{ketua_tim_nama}}', category: 'Data Tim', description: 'Nama ketua tim' },
          { id: 'ketua_tim_nip', label: 'NIP Ketua Tim', variable: '{{ketua_tim_nip}}', category: 'Data Tim', description: 'NIP ketua tim' },
          { id: 'ketua_tim_jabatan', label: 'Jabatan Ketua Tim', variable: '{{ketua_tim_jabatan}}', category: 'Data Tim', description: 'Jabatan ketua tim' }
        )
      } else if (field.fieldType !== 'SIGNATURE' && field.fieldType !== 'FILE' && field.fieldType !== 'WHATSAPP') {
        // Add field as variable
        const slug = generateSlug(field.label)
        variables.push({
          id: field.id,
          label: field.label,
          variable: `{{${slug}}}`,
          category: 'Data Form',
          description: `Dari field: ${field.label}`
        })
      }
    })

    return variables
  }

  const variables = buildVariables()
  const categories = Array.from(new Set(variables.map(v => v.category)))

  const handleCopy = (variable: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(variable)
    setCopiedVar(variable)
    setTimeout(() => setCopiedVar(null), 2000)

    if (onSelect) {
      onSelect(variable)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span>Insert Variable</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <h4 className="font-semibold text-gray-900">Variables Template</h4>
              <p className="text-xs text-gray-600 mt-1">
                Klik untuk copy variable ke clipboard
              </p>
            </div>

            <div className="p-2">
              {categories.map(category => (
                <div key={category} className="mb-3">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {variables
                      .filter(v => v.category === category)
                      .map(variable => (
                        <button
                          key={variable.id}
                          type="button"
                          onClick={(e) => handleCopy(variable.variable, e)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {variable.label}
                              </div>
                              <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {variable.variable}
                              </code>
                              {variable.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {variable.description}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {copiedVar === variable.variable ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600">
                <strong>Catatan:</strong> Variable akan diganti dengan data real saat generate PDF
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
