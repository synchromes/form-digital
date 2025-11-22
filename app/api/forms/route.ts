import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const forms = await prisma.formTemplate.findMany({
      where: {
        isActive: true,
        deletedAt: null // Only get non-deleted forms
      },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(forms)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, slug, fields, documentTemplate, signatureBoxes } = body

    // Check if slug already exists
    const existing = await prisma.formTemplate.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const form = await prisma.formTemplate.create({
      data: {
        title,
        description,
        slug,
        documentTemplate: documentTemplate || null,
        signatureBoxes: signatureBoxes || null,
        fields: {
          create: fields.map((field: any, index: number) => ({
            label: field.label,
            fieldType: field.fieldType,
            placeholder: field.placeholder || '',
            required: field.required || false,
            options: field.options || '',
            allowPastDates: field.allowPastDates ?? true,
            order: index,
          })),
        },
      },
      include: {
        fields: true,
      },
    })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
