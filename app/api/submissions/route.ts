import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    const formTemplateId = searchParams.get('formTemplateId') || 'all'
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      deletedAt: null // Only get non-deleted submissions
    }

    if (status !== 'all') {
      where.status = status
    }

    if (formTemplateId !== 'all') {
      where.formTemplateId = formTemplateId
    }

    // Get submissions
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
        include: {
          formTemplate: true,
          data: {
            include: {
              field: true,
            },
          },
        },
      }),
      prisma.submission.count({ where }),
    ])

    // Filter by search if provided (search in submitter name)
    let filteredSubmissions = submissions
    if (search) {
      filteredSubmissions = submissions.filter((submission) => {
        const nameField = submission.data.find((d: any) =>
          d.field.label.toLowerCase().includes('nama')
        )
        const submitterName = nameField?.value || ''
        return (
          submitterName.toLowerCase().includes(search.toLowerCase()) ||
          submission.id.toLowerCase().includes(search.toLowerCase())
        )
      })
    }

    return NextResponse.json({
      submissions: search ? filteredSubmissions : submissions,
      pagination: {
        page,
        limit,
        total: search ? filteredSubmissions.length : total,
        totalPages: Math.ceil((search ? filteredSubmissions.length : total) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formTemplateId, data } = body

    // Fetch form template to get snapshot data
    const formTemplate = await prisma.formTemplate.findUnique({
      where: { id: formTemplateId },
      select: { documentTemplate: true, signatureBoxes: true }
    })

    if (!formTemplate) {
      return NextResponse.json({ error: 'Form template not found' }, { status: 404 })
    }

    const submission = await prisma.submission.create({
      data: {
        formTemplateId,
        snapshotTemplate: formTemplate.documentTemplate,
        snapshotSignatureBoxes: formTemplate.signatureBoxes,
        data: {
          create: data.map((item: { fieldId: string; value: string }) => ({
            fieldId: item.fieldId,
            value: item.value,
          })),
        },
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

    // Send WhatsApp notification
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

        const message = `*KONFIRMASI PENGAJUAN SURAT*\n\n` +
          `Halo ${submitterName},\n\n` +
          `Pengajuan surat Anda telah diterima dengan rincian:\n\n` +
          `📋 Jenis Surat: ${submission.formTemplate.title}\n` +
          `🆔 ID Pengajuan: ${submission.id}\n` +
          `📅 Tanggal: ${new Date(submission.submittedAt).toLocaleString('id-ID')}\n` +
          `⏳ Status: Menunggu Persetujuan\n\n` +
          `Anda dapat mengecek status pengajuan di:\n\n` +
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/check-status?id=${submission.id}\n\n` +
          `Terima kasih!`

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
      // Log but don't fail the submission if WhatsApp fails
      console.error('Failed to send WhatsApp notification:', waError)
    }

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }
}
