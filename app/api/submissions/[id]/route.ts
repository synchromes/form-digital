import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        formTemplate: {
          include: {
            fields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        data: {
          include: {
            field: true,
          },
          orderBy: {
            field: {
              order: 'asc',
            },
          },
        },
      },
    })

    // Check if submission exists and is not deleted
    if (!submission || submission.deletedAt !== null) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check if there's a TIM field and fetch tim data
    let timData = null
    const timField = submission.formTemplate.fields.find(f => f.fieldType === 'TIM')
    if (timField) {
      const timSubmission = submission.data.find(d => d.fieldId === timField.id)
      if (timSubmission?.value) {
        timData = await prisma.tim.findUnique({
          where: { id: timSubmission.value },
          include: {
            ketuaTim: {
              select: {
                nama: true,
                nip: true,
                jabatan: true,
              },
            },
          },
        })
      }
    }

    return NextResponse.json({
      ...submission,
      timData,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, rejectionReason } = body

    // Get old status to check if it changed
    const oldSubmission = await prisma.submission.findUnique({
      where: { id },
      select: { status: true },
    })

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null
      },
      include: {
        data: {
          include: {
            field: true,
          },
        },
        formTemplate: true,
      },
    })

    // Send WhatsApp notification if status changed to approved or rejected
    if (oldSubmission && oldSubmission.status !== status && (status === 'approved' || status === 'rejected')) {
      try {
        // Get WhatsApp number from submission data
        const whatsappField = submission.data.find(d => d.field.fieldType === 'WHATSAPP')
        const whatsappNumber = whatsappField?.value

        if (whatsappNumber) {
          // Get submitter name
          const nameField = submission.data.find(d =>
            d.field.label.toLowerCase().includes('nama')
          )
          const submitterName = nameField?.value || 'Pemohon'

          let message = ''

          if (status === 'approved') {
            message = `*PENGAJUAN SURAT DISETUJUI ✅*\n\n` +
              `Halo ${submitterName},\n\n` +
              `Kabar baik! Pengajuan surat Anda telah *DISETUJUI*.\n\n` +
              `📋 Jenis Surat: ${submission.formTemplate.title}\n` +
              `🆔 ID Pengajuan: ${submission.id}\n` +
              `📅 Tanggal Disetujui: ${new Date().toLocaleString('id-ID')}\n` +
              `✅ Status: Disetujui\n\n` +
              `Silakan hubungi bagian SDM untuk proses selanjutnya.\n\n` +
              `Terima kasih!`
          } else if (status === 'rejected') {
            message = `*PENGAJUAN SURAT DITOLAK ❌*\n\n` +
              `Halo ${submitterName},\n\n` +
              `Mohon maaf, pengajuan surat Anda *DITOLAK*.\n\n` +
              `📋 Jenis Surat: ${submission.formTemplate.title}\n` +
              `🆔 ID Pengajuan: ${submission.id}\n` +
              `📅 Tanggal Ditolak: ${new Date().toLocaleString('id-ID')}\n` +
              `❌ Status: Ditolak\n\n`

            if (rejectionReason) {
              message += `📝 Alasan Penolakan:\n${rejectionReason}\n\n`
            }

            message += `Anda dapat cek detail di:\n\n` +
              `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.localhost:3000'}/check-status?id=${submission.id}\n\n` +
              `Silakan hubungi bagian SDM untuk informasi lebih lanjut.\n\n` +
              `Terima kasih!`
          }

          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: whatsappNumber,
              message,
            }),
          })
        }
      } catch (waError) {
        // Log but don't fail the update if WhatsApp fails
        console.error('Failed to send WhatsApp notification:', waError)
      }
    }

    return NextResponse.json(submission)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
