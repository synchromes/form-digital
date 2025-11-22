import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Start new session and get QR code
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

    const gatewayUrl = config.gatewayUrl.replace(/\/$/, '')
    const url = `${gatewayUrl}/session/start`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['key'] = config.apiKey
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session: config.sessionName,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Failed to start WhatsApp session',
      }, { status: response.status })
    }

    const data = await response.json()

    // If QR code is returned, session is not yet connected
    if (data.qr) {
      return NextResponse.json({
        success: true,
        qr: data.qr,
        message: 'Please scan the QR code with WhatsApp',
      })
    }

    // Session already connected
    await prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: {
        isConnected: true,
        lastChecked: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Session already connected',
    })
  } catch (error) {
    console.error('Error starting WhatsApp session:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to start WhatsApp session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Delete/logout session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await prisma.whatsAppConfig.findFirst()

    if (!config) {
      return NextResponse.json({ error: 'WhatsApp config not found' }, { status: 404 })
    }

    const gatewayUrl = config.gatewayUrl.replace(/\/$/, '')
    const url = `${gatewayUrl}/session/logout`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['key'] = config.apiKey
    }

    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session: config.sessionName,
      }),
    })

    await prisma.whatsAppConfig.update({
      where: { id: config.id },
      data: {
        isConnected: false,
        lastChecked: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Session logged out successfully',
    })
  } catch (error) {
    console.error('Error logging out WhatsApp session:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to logout WhatsApp session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
