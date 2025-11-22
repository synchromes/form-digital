'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, Copy, Search } from 'lucide-react'
import { useState } from 'react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('id')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (submissionId) {
      navigator.clipboard.writeText(submissionId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl font-bold text-blue-600">TVRI</span>
            </div>
          </div>
        </div>

        <Card>
          <CardBody className="text-center py-12">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Pengajuan Berhasil!
            </h1>
            <p className="text-gray-600 mb-6">
              Terima kasih. Pengajuan surat Anda telah berhasil dikirim dan akan segera diproses oleh tim kami.
            </p>
            {submissionId && (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-xl p-5 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    ID Surat Anda:
                  </p>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-base font-mono font-bold text-blue-600 break-all">
                      {submissionId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Tersalin!' : 'Salin ID'}
                  </button>
                  <p className="text-xs text-gray-600 mt-3">
                    Simpan ID ini untuk mengecek status pengajuan Anda
                  </p>
                </div>

                <Link href="/check-status" className="block mb-3">
                  <Button className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Cek Status Surat
                  </Button>
                </Link>
              </>
            )}
            <div className="space-y-3">
              <Link href="/form" className="block">
                <Button variant="secondary" className="w-full">
                  Buat Pengajuan Lain
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-6">
          <p className="text-blue-100 text-sm">
            &copy; 2025 SDM LPP TVRI Kalimantan Barat
          </p>
        </div>
      </div>
    </div>
  )
}
