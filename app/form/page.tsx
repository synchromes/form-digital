import Link from 'next/link'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getForms() {
  return await prisma.formTemplate.findMany({
    where: {
      isActive: true,
      deletedAt: null // Only show non-deleted forms
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function FormListPage() {
  const forms = await getForms()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-xl md:text-2xl font-bold text-blue-600">TVRI</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Pilih Jenis Pengajuan
            </h1>
            <p className="text-blue-100 text-sm md:text-base">
              Silakan pilih jenis surat yang ingin Anda ajukan
            </p>
          </div>

          {/* Forms List */}
          {forms.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada form tersedia
                </h3>
                <p className="text-gray-600">
                  Silakan hubungi administrator
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/form/${form.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardBody className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {form.title}
                          </h3>
                          {form.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {form.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-blue-100 hover:text-white transition-colors text-sm md:text-base"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
