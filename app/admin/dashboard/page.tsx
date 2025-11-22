import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { FileText, Users, CheckCircle, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getStats() {
  const [totalForms, totalSubmissions, pendingSubmissions, approvedSubmissions] = await Promise.all([
    prisma.formTemplate.count({ where: { isActive: true, deletedAt: null } }),
    prisma.submission.count({ where: { deletedAt: null } }),
    prisma.submission.count({ where: { status: 'pending', deletedAt: null } }),
    prisma.submission.count({ where: { status: 'approved', deletedAt: null } }),
  ])

  return { totalForms, totalSubmissions, pendingSubmissions, approvedSubmissions }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      title: 'Total Form Aktif',
      value: stats.totalForms,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Pengajuan',
      value: stats.totalSubmissions,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Menunggu Persetujuan',
      value: stats.pendingSubmissions,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Disetujui',
      value: stats.approvedSubmissions,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem pengajuan surat TVRI</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Aktivitas Terbaru</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600">
              Fitur aktivitas terbaru akan ditampilkan di sini.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
