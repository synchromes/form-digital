import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET WhatsApp Config
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let config = await prisma.whatsAppConfig.findFirst()

    // Create default config if not exists
    if (!config) {
      config = await prisma.whatsAppConfig.create({
        data: {
          gatewayUrl: 'http://localhost:5001',
          sessionName: 'tvri-form',
          isActive: false,
          isConnected: false,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error)
    return NextResponse.json({ error: 'Failed to fetch WhatsApp config' }, { status: 500 })
  }
}

// PUT/PATCH WhatsApp Config
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { gatewayUrl, sessionName, apiKey, isActive } = body

    // Get or create config
    let config = await prisma.whatsAppConfig.findFirst()

    if (!config) {
      config = await prisma.whatsAppConfig.create({
        data: {
          gatewayUrl: gatewayUrl || 'http://localhost:5001',
          sessionName: sessionName || 'tvri-form',
          apiKey: apiKey || null,
          isActive: isActive || false,
          isConnected: false,
        },
      })
    } else {
      config = await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: {
          gatewayUrl,
          sessionName,
          apiKey,
          isActive,
        },
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating WhatsApp config:', error)
    return NextResponse.json({ error: 'Failed to update WhatsApp config' }, { status: 500 })
  }
}
