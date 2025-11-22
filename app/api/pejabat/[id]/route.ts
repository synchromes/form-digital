import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get pejabat detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pejabat = await prisma.pejabat.findUnique({
      where: { id },
      include: {
        timDipimpin: {
          where: { deletedAt: null },
          select: {
            id: true,
            namaTim: true,
          }
        },
      },
    })

    // Check if pejabat exists and not deleted
    if (!pejabat || pejabat.deletedAt !== null) {
      return NextResponse.json({ error: 'Pejabat not found' }, { status: 404 })
    }

    return NextResponse.json(pejabat)
  } catch (error) {
    console.error('Error fetching pejabat:', error)
    return NextResponse.json({ error: 'Failed to fetch pejabat' }, { status: 500 })
  }
}

// PUT - Update pejabat
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
    const { nama, nip, jabatan, isActive } = body

    // Check if NIP is taken by another pejabat
    if (nip) {
      const existing = await prisma.pejabat.findFirst({
        where: {
          nip,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'NIP sudah digunakan oleh pejabat lain' },
          { status: 400 }
        )
      }
    }

    const pejabat = await prisma.pejabat.update({
      where: { id },
      data: {
        nama,
        nip,
        jabatan,
        isActive,
      },
    })

    return NextResponse.json(pejabat)
  } catch (error) {
    console.error('Error updating pejabat:', error)
    return NextResponse.json({ error: 'Failed to update pejabat' }, { status: 500 })
  }
}

// DELETE - Soft delete pejabat
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

    // Soft delete the pejabat
    await prisma.pejabat.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Pejabat deleted successfully' })
  } catch (error) {
    console.error('Error deleting pejabat:', error)
    return NextResponse.json({ error: 'Failed to delete pejabat' }, { status: 500 })
  }
}
