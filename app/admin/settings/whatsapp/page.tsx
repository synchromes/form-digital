'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import {
  MessageCircle,
  Check,
  X,
  RefreshCw,
  QrCode,
  Link2,
  Key,
  Info,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'

interface WhatsAppConfig {
  id: string
  gatewayUrl: string
  sessionName: string
  apiKey: string | null
  isActive: boolean
  isConnected: boolean
  lastChecked: string | null
}

export default function WhatsAppSettingsPage() {
  const toast = useToast()
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    needsQR?: boolean
  } | null>(null)

  // Form state
  const [gatewayUrl, setGatewayUrl] = useState('')
  const [sessionName, setSessionName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/whatsapp/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        setGatewayUrl(data.gatewayUrl)
        setSessionName(data.sessionName)
        setApiKey(data.apiKey || '')
        setIsActive(data.isActive)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setTestResult(null)
    try {
      const response = await fetch('/api/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewayUrl,
          sessionName,
          apiKey: apiKey || null,
          isActive,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
        toast.success('Konfigurasi WhatsApp berhasil disimpan!')
      } else {
        toast.error('Gagal menyimpan konfigurasi')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    setQrCode(null)
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
      })

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        await fetchConfig() // Refresh config to update connection status
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setTestResult({
        success: false,
        message: 'Gagal menghubungi WhatsApp Gateway',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleStartSession = async () => {
    setIsStartingSession(true)
    setQrCode(null)
    setTestResult(null)
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.qr) {
        setQrCode(data.qr)
        setTestResult({
          success: true,
          message: 'Silakan scan QR code dengan WhatsApp Anda',
        })
      } else {
        setTestResult(data)
        await fetchConfig()
      }
    } catch (error) {
      console.error('Error starting session:', error)
      setTestResult({
        success: false,
        message: 'Gagal memulai sesi WhatsApp',
      })
    } finally {
      setIsStartingSession(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-green-600" />
          Pengaturan WhatsApp Gateway
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Konfigurasi WhatsApp Gateway untuk notifikasi otomatis
        </p>
      </div>

      {/* Connection Status */}
      {config && (
        <Card className="border-l-4" style={{ borderLeftColor: config.isConnected ? '#10b981' : '#ef4444' }}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {config.isConnected ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {config.isConnected ? 'Terhubung' : 'Tidak Terhubung'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {config.lastChecked
                      ? `Terakhir dicek: ${new Date(config.lastChecked).toLocaleString('id-ID')}`
                      : 'Belum pernah dicek'}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Test Koneksi
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Test Result */}
      {testResult && (
        <Card className={testResult.success ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}>
          <CardBody>
            <div className="flex items-start gap-3">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {testResult.message}
                </p>
                {testResult.needsQR && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={handleStartSession}
                    disabled={isStartingSession}
                  >
                    {isStartingSession ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="w-4 h-4 mr-2" />
                    )}
                    Mulai Sesi & Tampilkan QR Code
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* QR Code Display */}
      {qrCode && (
        <Card>
          <CardBody className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Scan QR Code dengan WhatsApp</h3>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="w-64 h-64 border-4 border-gray-300 rounded-lg" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              1. Buka WhatsApp di ponsel Anda<br />
              2. Tap Menu atau Settings dan pilih Linked Devices<br />
              3. Tap Link a Device<br />
              4. Arahkan ponsel ke layar ini untuk scan QR code
            </p>
            <Button variant="secondary" onClick={handleTestConnection}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Cek Status Koneksi
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Configuration Form */}
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Konfigurasi Gateway</h2>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Link2 className="w-4 h-4" />
              Gateway URL
            </label>
            <Input
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="http://localhost:5001"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL WhatsApp Gateway (default: http://localhost:5001)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4" />
              Nama Sesi
            </label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="tvri-form"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nama sesi untuk identifikasi (default: tvri-form)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4" />
              API Key (Opsional)
            </label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Kosongkan jika tidak ada"
              type="password"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              API Key untuk autentikasi ke WhatsApp Gateway (jika diperlukan)
            </p>
          </div>

          <div className="pt-3 border-t">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Aktifkan Notifikasi WhatsApp</p>
                <p className="text-sm text-gray-600">
                  Kirim notifikasi otomatis melalui WhatsApp saat ada pengajuan baru atau perubahan status
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Simpan Konfigurasi
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardBody>
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Panduan Setup WhatsApp Gateway
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Pastikan WhatsApp Gateway sudah berjalan di server (default: localhost:5001)</li>
            <li>Isi konfigurasi di atas sesuai dengan setup WhatsApp Gateway Anda</li>
            <li>Klik "Simpan Konfigurasi" untuk menyimpan pengaturan</li>
            <li>Klik "Test Koneksi" untuk memastikan gateway dapat diakses</li>
            <li>Jika belum ada sesi, klik "Mulai Sesi & Tampilkan QR Code"</li>
            <li>Scan QR code dengan WhatsApp di ponsel Anda</li>
            <li>Setelah terhubung, aktifkan "Notifikasi WhatsApp" untuk mengirim pesan otomatis</li>
          </ol>
        </CardBody>
      </Card>
    </div>
  )
}
