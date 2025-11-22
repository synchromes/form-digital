import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 })
    }

    const config = await prisma.whatsAppConfig.findFirst()

    if (!config) {
      return NextResponse.json({ error: 'WhatsApp config not found' }, { status: 404 })
    }

    if (!config.isActive) {
      return NextResponse.json({
        success: false,
        message: 'WhatsApp notifications are disabled',
      })
    }

    if (!config.isConnected) {
      return NextResponse.json({
        success: false,
        message: 'WhatsApp is not connected. Please scan QR code first.',
      })
    }

    // Clean phone number (remove spaces, dashes, etc.)
    let phoneNumber = to.replace(/[^\d]/g, '')

    // Add country code if not present (assume Indonesia +62)
    if (!phoneNumber.startsWith('62')) {
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '62' + phoneNumber.substring(1)
      } else {
        phoneNumber = '62' + phoneNumber
      }
    }

    const gatewayUrl = config.gatewayUrl.replace(/\/$/, '')
    const url = `${gatewayUrl}/message/send-text`

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
        to: phoneNumber,
        text: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Failed to send WhatsApp message:', errorData)
      return NextResponse.json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: errorData,
      }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      data,
    })
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
