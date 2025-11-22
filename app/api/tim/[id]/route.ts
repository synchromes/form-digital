import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get tim detail
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
    const tim = await prisma.tim.findUnique({
      where: { id },
      include: {
        ketuaTim: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          }
        },
        forms: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
          }
        }
      },
    })

    // Check if tim exists and not deleted
    if (!tim || tim.deletedAt !== null) {
      return NextResponse.json({ error: 'Tim not found' }, { status: 404 })
    }

    return NextResponse.json(tim)
  } catch (error) {
    console.error('Error fetching tim:', error)
    return NextResponse.json({ error: 'Failed to fetch tim' }, { status: 500 })
  }
}

// PUT - Update tim
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
    const { namaTim, ketuaTimId, isActive } = body

    // Check if ketua tim exists (if provided)
    if (ketuaTimId) {
      const ketuaTim = await prisma.pejabat.findUnique({
        where: { id: ketuaTimId },
      })

      if (!ketuaTim || ketuaTim.deletedAt !== null) {
        return NextResponse.json(
          { error: 'Ketua Tim tidak ditemukan' },
          { status: 400 }
        )
      }
    }

    const tim = await prisma.tim.update({
      where: { id },
      data: {
        namaTim,
        ketuaTimId,
        isActive,
      },
      include: {
        ketuaTim: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          }
        }
      }
    })

    return NextResponse.json(tim)
  } catch (error) {
    console.error('Error updating tim:', error)
    return NextResponse.json({ error: 'Failed to update tim' }, { status: 500 })
  }
}

// DELETE - Soft delete tim
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

    // Soft delete the tim
    await prisma.tim.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Tim deleted successfully' })
  } catch (error) {
    console.error('Error deleting tim:', error)
    return NextResponse.json({ error: 'Failed to delete tim' }, { status: 500 })
  }
}
