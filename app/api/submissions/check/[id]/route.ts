import { NextRequest, NextResponse } from 'next/server'
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
          select: {
            title: true,
            description: true,
            fields: {
              select: {
                id: true,
                fieldType: true,
              }
            }
          },
        },
        data: {
          include: {
            field: {
              select: {
                label: true,
                fieldType: true,
                order: true,
              },
            },
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
      const timSubmission = submission.data.find(d => d.fieldId === timField.id) // Note: fieldId might not be directly available in data include above, need to check schema or adjust include
      // Wait, submission.data includes 'field' relation, but we need to match with formTemplate.fields.
      // Actually, submission.data has fieldId foreign key. But in the include above we only included 'field'.
      // Let's check schema. SubmissionData has fieldId.
      // But wait, the include above for data is: include: { field: { select: ... } }. Prisma returns the relation object.
      // We can match by field.fieldType === 'TIM' directly from the data array since we include field type.

      const timDataEntry = submission.data.find(d => d.field.fieldType === 'TIM')
      if (timDataEntry?.value) {
        timData = await prisma.tim.findUnique({
          where: { id: timDataEntry.value },
          select: { namaTim: true }
        })
      }
    }

    // Return submission data (public access, no auth required)
    return NextResponse.json({
      ...submission,
      timData
    })
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 })
  }
}
