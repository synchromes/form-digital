import Link from 'next/link'
import { FileText, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <span className="text-3xl font-bold text-blue-600">TVRI</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sistem Pengajuan Surat Digital
            </h1>
            <p className="text-xl text-blue-100">
              LPP TVRI Kalimantan Barat
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Card */}
            <Link
              href="/form"
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Pengajuan Surat
                </h2>
                <p className="text-gray-600">
                  Ajukan permohonan surat secara online dengan mudah dan cepat
                </p>
              </div>
            </Link>

            {/* Check Status Card */}
            <Link
              href="/check-status"
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Cek Status Surat
                </h2>
                <p className="text-gray-600">
                  Lacak status pengajuan surat Anda dengan memasukkan ID surat
                </p>
              </div>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-blue-100 mb-4">
              &copy; 2025 SDM LPP TVRI Kalimantan Barat. All rights reserved.
            </p>
            <Link
              href="/admin/login"
              className="text-blue-100 hover:text-white transition-colors text-sm underline"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
