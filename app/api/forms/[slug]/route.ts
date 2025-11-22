import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const form = await prisma.formTemplate.findUnique({
      where: { slug },
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
