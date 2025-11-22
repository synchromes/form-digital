import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  MessageCircle,
  Database,
  Shield,
  Zap,
  Code,
  Smartphone,
  Bell,
  Filter,
  Layout,
  Settings,
  Globe,
  Server
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getSystemStats() {
  try {
    const [totalForms, totalSubmissions, pendingSubmissions, approvedSubmissions, rejectedSubmissions] = await Promise.all([
      prisma.formTemplate.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: 'pending' } }),
      prisma.submission.count({ where: { status: 'approved' } }),
      prisma.submission.count({ where: { status: 'rejected' } }),
    ])

    return {
      totalForms,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    }
  } catch (error) {
    return {
      totalForms: 0,
      totalSubmissions: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
    }
  }
}

export default async function AboutPage() {
  const stats = await getSystemStats()

  const features = [
    {
      icon: FileText,
      title: 'Custom Form Builder',
      description: 'Buat form pengajuan surat dengan field custom sesuai kebutuhan organisasi',
      color: 'blue'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Notifications',
      description: 'Notifikasi otomatis via WhatsApp untuk setiap pengajuan dan perubahan status',
      color: 'green'
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter dan pagination untuk mengelola data pengajuan dengan mudah',
      color: 'purple'
    },
    {
      icon: CheckCircle,
      title: 'Approval System',
      description: 'Sistem approval/rejection dengan alasan penolakan yang transparan',
      color: 'emerald'
    },
    {
      icon: Globe,
      title: 'Public Status Check',
      description: 'Pemohon dapat mengecek status pengajuan secara real-time',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Sistem autentikasi aman untuk admin menggunakan NextAuth.js',
      color: 'red'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Tampilan optimal di desktop, tablet, dan smartphone',
      color: 'indigo'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Data selalu up-to-date tanpa perlu refresh manual',
      color: 'yellow'
    }
  ]

  const techStack = [
    {
      category: 'Frontend',
      icon: Code,
      technologies: [
        { name: 'Next.js 15', description: 'React Framework dengan App Router' },
        { name: 'TypeScript', description: 'Type-safe JavaScript' },
        { name: 'Tailwind CSS', description: 'Utility-first CSS Framework' },
        { name: 'Lucide Icons', description: 'Beautiful & consistent icons' },
      ]
    },
    {
      category: 'Backend',
      icon: Server,
      technologies: [
        { name: 'Next.js API Routes', description: 'Serverless API endpoints' },
        { name: 'Prisma ORM', description: 'Type-safe database toolkit' },
        { name: 'NextAuth.js', description: 'Authentication for Next.js' },
        { name: 'MySQL', description: 'Relational database' },
      ]
    },
    {
      category: 'Integration',
      icon: Settings,
      technologies: [
        { name: 'WhatsApp Gateway', description: 'wa-multi-session library' },
        { name: 'Hono Framework', description: 'Fast web framework for gateway' },
        { name: 'QR Code', description: 'WhatsApp authentication' },
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    }
    return colors[color] || 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tentang Sistem</h1>
        <p className="text-gray-600">Informasi lengkap tentang sistem pengajuan surat LPP TVRI</p>
      </div>

      {/* System Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sistem Pengajuan Surat LPP TVRI
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Platform digital untuk mengelola pengajuan surat karyawan LPP TVRI secara efisien dan terstruktur.
                Sistem ini dilengkapi dengan form builder yang fleksibel, notifikasi WhatsApp otomatis, dan
                dashboard admin yang komprehensif untuk mempercepat proses approval.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-medium">
                  Version x.x.x
                </span>
                <span className="px-3 py-1 bg-white text-gray-700 rounded-full font-medium border border-gray-300">
                  Under Development
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Form</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalForms}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pengajuan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-gray-900">{stats.approvedSubmissions}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ditolak</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejectedSubmissions}</p>
              </div>
              <Bell className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </CardBody>
        </Card>
      </div> */}

      {/* Features */}
      {/* <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fitur Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className={`border-2 ${getColorClasses(feature.color).split(' ')[2]}`}>
                <CardBody className="p-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getColorClasses(feature.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div> */}

      {/* Technology Stack */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {techStack.map((stack, index) => {
            const Icon = stack.icon
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{stack.category}</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {stack.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="border-l-2 border-blue-200 pl-3">
                        <p className="font-medium text-gray-900">{tech.name}</p>
                        <p className="text-sm text-gray-600">{tech.description}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>

      {/* System Requirements */}
      {/* <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">System Requirements</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Server Requirements
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Node.js v18 atau lebih tinggi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>MySQL 8.0 atau lebih tinggi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Minimal RAM 2GB (Recommended 4GB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Storage minimal 1GB untuk database</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Client Requirements
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Browser modern (Chrome, Firefox, Safari, Edge)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>JavaScript harus diaktifkan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Koneksi internet stabil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>WhatsApp untuk notifikasi (opsional)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card> */}

      {/* Credits */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardBody className="p-6">
          <div className="text-center">
            <Database className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Developed By</h2>
            <p className="text-lg text-gray-700 mb-4">
              LPP TVRI Kalimantan Barat Development Team
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="px-4 py-2 bg-white rounded-lg border border-gray-300 font-medium">
                © 2025 LPP TVRI Kalimantan Barat
              </span>
              <span className="px-4 py-2 bg-white rounded-lg border border-gray-300 font-medium">
                All Rights Reserved
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Support Info */}
      <Card className="border-l-4 border-l-blue-600">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-600 mb-3">
                Jika Anda mengalami kendala atau memiliki pertanyaan seputar penggunaan sistem,
                silakan hubungi bagian IT LPP TVRI Kalimantan Barat.
              </p>
              <div className="text-sm text-gray-600">
                <p>📧 Email: support@tvri-kalbar.com</p>
                <p>📞 Telp: (0561) 123-4567</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
