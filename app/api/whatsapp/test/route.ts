import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.whatsAppConfig.findFirst()

    if (!config) {
      return NextResponse.json({ error: 'WhatsApp config not found' }, { status: 404 })
    }

    // Test connection to WhatsApp Gateway
    const gatewayUrl = config.gatewayUrl.replace(/\/$/, '') // Remove trailing slash
    const url = `${gatewayUrl}/session`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['key'] = config.apiKey
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: {
          isConnected: false,
          lastChecked: new Date(),
        },
      })

      return NextResponse.json({
        success: false,
        message: 'Failed to connect to WhatsApp Gateway',
        error: `HTTP ${response.status}`,
      })
    }

    const data = await response.json()
    const sessions = data.data || []

    // Check if the configured session exists and is connected
    const sessionExists = sessions.includes(config.sessionName)

    await prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: {
        isConnected: sessionExists,
        lastChecked: new Date(),
      },
    })

    if (!sessionExists) {
      return NextResponse.json({
        success: false,
        message: `Session '${config.sessionName}' not found. Please scan QR code to start session.`,
        sessions,
        needsQR: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp Gateway connected successfully',
      sessions,
    })
  } catch (error) {
    console.error('Error testing WhatsApp connection:', error)

    // Update connection status
    const config = await prisma.whatsAppConfig.findFirst()
    if (config) {
      await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: {
          isConnected: false,
          lastChecked: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to connect to WhatsApp Gateway',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
