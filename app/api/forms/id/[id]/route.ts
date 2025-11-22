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
    const form = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // Check if form exists and is not deleted
    if (!form || form.deletedAt !== null) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

export async function PUT(
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
    const { title, description, slug, isActive, documentTemplate, signatureBoxes, fields } = body

    // Check if slug is taken by another form
    const existing = await prisma.formTemplate.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Get existing fields
    const existingFields = await prisma.formField.findMany({
      where: { formTemplateId: id },
      select: { id: true },
    })

    const existingFieldIds = new Set(existingFields.map(f => f.id))
    const incomingFieldIds = new Set(
      fields
        .filter((f: any) => f.id && f.id.length > 10) // UUID check
        .map((f: any) => f.id)
    )

    // Determine which fields to delete (exist in DB but not in incoming)
    const fieldsToDelete = existingFields
      .filter(f => !incomingFieldIds.has(f.id))
      .map(f => f.id)

    // Only delete fields that are truly removed AND have no submission data
    if (fieldsToDelete.length > 0) {
      // Check if any of these fields have submission data
      const submissionsUsingFields = await prisma.submissionData.findMany({
        where: {
          fieldId: { in: fieldsToDelete },
        },
        select: { fieldId: true },
        distinct: ['fieldId'],
      })

      const fieldsWithData = new Set(submissionsUsingFields.map(s => s.fieldId))
      const safeToDelete = fieldsToDelete.filter(fid => !fieldsWithData.has(fid))

      // Only delete fields that have no submission data
      if (safeToDelete.length > 0) {
        await prisma.formField.deleteMany({
          where: { id: { in: safeToDelete } },
        })
      }
    }

    // Update form and handle fields
    const form = await prisma.formTemplate.update({
      where: { id },
      data: {
        title,
        description,
        slug,
        isActive,
        documentTemplate: documentTemplate || null,
        signatureBoxes: signatureBoxes || null,
      },
      include: {
        fields: true,
      },
    })

    // Update existing fields or create new ones
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index]
      const fieldData = {
        label: field.label,
        fieldType: field.fieldType,
        placeholder: field.placeholder || '',
        required: field.required || false,
        options: field.options || '',
        allowPastDates: field.allowPastDates ?? true,
        order: index,
      }

      if (field.id && field.id.length > 10) {
        // Existing field - update it
        await prisma.formField.update({
          where: { id: field.id },
          data: fieldData,
        })
      } else {
        // New field - create it
        await prisma.formField.create({
          data: {
            ...fieldData,
            formTemplateId: id,
          },
        })
      }
    }

    // Fetch updated form with fields
    const updatedForm = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedForm)
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft delete: set deletedAt timestamp
    const now = new Date()

    // Soft delete all submissions related to this form
    await prisma.submission.updateMany({
      where: {
        formTemplateId: id,
        deletedAt: null // Only update non-deleted submissions
      },
      data: {
        deletedAt: now
      }
    })

    // Soft delete the form
    await prisma.formTemplate.update({
      where: { id },
      data: {
        deletedAt: now
      }
    })

    return NextResponse.json({ message: 'Form deleted successfully' })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
