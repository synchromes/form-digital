import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all pejabat (only active, not deleted)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pejabat = await prisma.pejabat.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        nama: 'asc',
      },
      include: {
        _count: {
          select: {
            timDipimpin: {
              where: { deletedAt: null }
            }
          }
        }
      }
    })

    return NextResponse.json(pejabat)
  } catch (error) {
    console.error('Error fetching pejabat:', error)
    return NextResponse.json({ error: 'Failed to fetch pejabat' }, { status: 500 })
  }
}

// POST - Create new pejabat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nama, nip, jabatan } = body

    // Validate required fields
    if (!nama || !nip || !jabatan) {
      return NextResponse.json(
        { error: 'Nama, NIP, dan Jabatan harus diisi' },
        { status: 400 }
      )
    }

    // Check if NIP already exists
    const existing = await prisma.pejabat.findUnique({
      where: { nip },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'NIP sudah terdaftar' },
        { status: 400 }
      )
    }

    const pejabat = await prisma.pejabat.create({
      data: {
        nama,
        nip,
        jabatan,
      },
    })

    return NextResponse.json(pejabat, { status: 201 })
  } catch (error) {
    console.error('Error creating pejabat:', error)
    return NextResponse.json({ error: 'Failed to create pejabat' }, { status: 500 })
  }
}
