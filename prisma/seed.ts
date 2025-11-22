import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tvri.go.id' },
    update: {},
    create: {
      email: 'admin@tvri.go.id',
      password: hashedPassword,
      name: 'Admin TVRI',
      role: 'admin',
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create sample form template
  const formTemplate = await prisma.formTemplate.upsert({
    where: { slug: 'pengajuan-reset-hp' },
    update: {},
    create: {
      title: 'Form Pengajuan Reset HP',
      description: 'Form untuk mengajukan reset handphone pegawai TVRI',
      slug: 'pengajuan-reset-hp',
      isActive: true,
      fields: {
        create: [
          {
            label: 'Nama Lengkap',
            fieldType: 'TEXT',
            placeholder: 'Masukkan nama lengkap',
            required: true,
            order: 0,
          },
          {
            label: 'NIP / NI PPPK',
            fieldType: 'TEXT',
            placeholder: 'Masukkan NIP',
            required: true,
            order: 1,
          },
          {
            label: 'Jenis Jabatan',
            fieldType: 'SELECT',
            placeholder: 'Pilih Jenis Jabatan',
            required: true,
            options: 'Struktural\nFungsional\nPelaksana',
            order: 2,
          },
          {
            label: 'Jabatan',
            fieldType: 'TEXT',
            placeholder: 'Pilih jenis jabatan terlebih dahulu',
            required: true,
            order: 3,
          },
          {
            label: 'Satuan Kerja',
            fieldType: 'SELECT',
            placeholder: 'Pilih Satuan Kerja',
            required: true,
            options: 'Kantor Pusat\nStasiun Jakarta\nStasiun Bandung\nStasiun Yogyakarta\nStasiun Surabaya',
            order: 4,
          },
          {
            label: 'Nomor HP',
            fieldType: 'PHONE',
            placeholder: 'Masukkan nomor HP (contoh: 08123456789)',
            required: true,
            order: 5,
          },
          {
            label: 'Tanggal Pengajuan',
            fieldType: 'DATE',
            placeholder: '',
            required: true,
            order: 6,
          },
          {
            label: 'HP Sebelumnya',
            fieldType: 'TEXT',
            placeholder: 'Masukkan nama device sebelumnya',
            required: false,
            order: 7,
          },
          {
            label: 'HP Saat Ini',
            fieldType: 'TEXT',
            placeholder: 'Masukkan nama device saat ini',
            required: false,
            order: 8,
          },
          {
            label: 'Kode Error',
            fieldType: 'TEXT',
            placeholder: 'Masukkan kode error yang muncul pada aplikasi',
            required: false,
            order: 9,
          },
          {
            label: 'Alasan Reset HP',
            fieldType: 'TEXTAREA',
            placeholder: 'Masukkan alasan reset gawai',
            required: true,
            order: 10,
          },
          {
            label: 'Upload Dokumen Pendukung',
            fieldType: 'FILE',
            placeholder: '',
            required: true,
            order: 11,
          },
          {
            label: 'Tanda Tangan Digital',
            fieldType: 'SIGNATURE',
            placeholder: '',
            required: true,
            order: 12,
          },
        ],
      },
    },
  })

  console.log('✅ Created form template:', formTemplate.title)

  // Create letter config
  const letterConfig = await prisma.letterConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      organizationName: 'LPP TVRI',
      letterhead: 'LPP TVRI Kalimantna Barat',
      footer: '© 2025 SDM LPP TVRI Kalbar - Sistem Pengajuan Surat Digital',
    },
  })

  console.log('✅ Created letter config')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
