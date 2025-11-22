import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all tim (only active, not deleted)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tim = await prisma.tim.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        namaTim: 'asc',
      },
      include: {
        ketuaTim: {
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
          }
        },
        _count: {
          select: {
            forms: {
              where: { deletedAt: null }
            }
          }
        }
      }
    })

    return NextResponse.json(tim)
  } catch (error) {
    console.error('Error fetching tim:', error)
    return NextResponse.json({ error: 'Failed to fetch tim' }, { status: 500 })
  }
}

// POST - Create new tim
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { namaTim, ketuaTimId } = body

    // Validate required fields
    if (!namaTim || !ketuaTimId) {
      return NextResponse.json(
        { error: 'Nama Tim dan Ketua Tim harus diisi' },
        { status: 400 }
      )
    }

    // Check if ketua tim exists
    const ketuaTim = await prisma.pejabat.findUnique({
      where: { id: ketuaTimId },
    })

    if (!ketuaTim || ketuaTim.deletedAt !== null) {
      return NextResponse.json(
        { error: 'Ketua Tim tidak ditemukan' },
        { status: 400 }
      )
    }

    const tim = await prisma.tim.create({
      data: {
        namaTim,
        ketuaTimId,
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

    return NextResponse.json(tim, { status: 201 })
  } catch (error) {
    console.error('Error creating tim:', error)
    return NextResponse.json({ error: 'Failed to create tim' }, { status: 500 })
  }
}
