import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const forms = await prisma.formTemplate.findMany({
      where: {
        deletedAt: null // Only get non-deleted forms
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            submissions: {
              where: { deletedAt: null } // Only count non-deleted submissions
            }
          },
        },
      },
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}
