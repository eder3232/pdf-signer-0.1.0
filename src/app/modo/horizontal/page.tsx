'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Upload,
  FileText,
  Trash2,
  Settings,
  Download,
  Plus,
  Minus,
  Eye,
  X,
  Check,
} from 'lucide-react'

interface Signature {
  id: string
  name: string
  imageUrl: string
}

interface AppliedSignature extends Signature {
  x: number
  y: number
  scale: number
  rotation: number
  opacity: number
  configured: boolean
}

interface PDFFile {
  name: string
  size: string
  pages: number
}

interface SignatureGalleryProps {
  onSignaturesSelected: (signatures: Signature[]) => void
}

function SignatureGallery({ onSignaturesSelected }: SignatureGalleryProps) {
  const [signatures, setSignatures] = useState<
    (Signature & { dateAdded: string; alias: string })[]
  >([])
  const [selectedSignatures, setSelectedSignatures] = useState<Set<string>>(
    new Set()
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [dragActive, setDragActive] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAlias, setEditingAlias] = useState('')

  // Load signatures from IndexedDB on mount
  useEffect(() => {
    loadSignaturesFromDB()
  }, [])

  const loadSignaturesFromDB = async () => {
    // Simulate loading from IndexedDB
    const mockSignatures = [
      {
        id: '1',
        name: 'Firma Principal',
        alias: 'Firma Principal',
        imageUrl: '/placeholder.svg?height=60&width=120',
        dateAdded: '2024-01-15',
      },
      {
        id: '2',
        name: 'Firma Secundaria',
        alias: 'Firma Secundaria',
        imageUrl: '/placeholder.svg?height=60&width=120',
        dateAdded: '2024-01-10',
      },
      {
        id: '3',
        name: 'Iniciales',
        alias: 'Iniciales JD',
        imageUrl: '/placeholder.svg?height=40&width=80',
        dateAdded: '2024-01-05',
      },
    ]
    setSignatures(mockSignatures)
  }

  const saveSignatureToDB = async (signature: any) => {
    // Simulate saving to IndexedDB
    setSignatures((prev) => [...prev, signature])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    setUploadStatus('uploading')

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
      return
    }

    try {
      for (const file of imageFiles) {
        const imageUrl = URL.createObjectURL(file)
        const newSignature = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ''),
          alias: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl,
          dateAdded: new Date().toISOString().split('T')[0],
        }
        await saveSignatureToDB(newSignature)
      }
      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 3000)
    } catch (error) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadStatus('uploading')

    try {
      for (const file of files) {
        const imageUrl = URL.createObjectURL(file)
        const newSignature = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name.replace(/\.[^/.]+$/, ''),
          alias: file.name.replace(/\.[^/.]+$/, ''),
          imageUrl,
          dateAdded: new Date().toISOString().split('T')[0],
        }
        await saveSignatureToDB(newSignature)
      }
      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 3000)
    } catch (error) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
  }

  const toggleSignatureSelection = (signatureId: string) => {
    const newSelected = new Set(selectedSignatures)
    if (newSelected.has(signatureId)) {
      newSelected.delete(signatureId)
    } else {
      newSelected.add(signatureId)
    }
    setSelectedSignatures(newSelected)
  }

  const removeSignature = (signatureId: string) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId))
    const newSelected = new Set(selectedSignatures)
    newSelected.delete(signatureId)
    setSelectedSignatures(newSelected)
  }

  const startEditing = (signature: any) => {
    setEditingId(signature.id)
    setEditingAlias(signature.alias)
  }

  const saveAlias = () => {
    setSignatures((prev) =>
      prev.map((sig) =>
        sig.id === editingId ? { ...sig, alias: editingAlias } : sig
      )
    )
    setEditingId(null)
    setEditingAlias('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingAlias('')
  }

  const applySelectedSignatures = () => {
    const selected = signatures.filter((sig) => selectedSignatures.has(sig.id))
    onSignaturesSelected(selected)
  }

  const filteredSignatures = signatures.filter(
    (sig) =>
      sig.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Cargando...'
      case 'success':
        return '¡Firma guardada!'
      case 'error':
        return 'Error al cargar'
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-3">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Área para subir firmas arrastrando archivos"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra imágenes de firma aquí o{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
              selecciona archivos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Seleccionar archivos de imagen para firmas"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, SVG hasta 5MB</p>
        </div>

        {uploadStatus !== 'idle' && (
          <div
            className={`text-sm font-medium ${getStatusColor()}`}
            role="status"
            aria-live="polite"
          >
            {getStatusMessage()}
          </div>
        )}
      </div>

      {/* Search */}
      {signatures.length > 0 && (
        <div>
          <input
            type="text"
            placeholder="Buscar firmas por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Buscar firmas"
          />
        </div>
      )}

      {/* Signatures Grid */}
      {filteredSignatures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
          {filteredSignatures.map((signature) => (
            <div
              key={signature.id}
              className={`group relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedSignatures.has(signature.id)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSignatureSelection(signature.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedSignatures.has(signature.id)}
              aria-label={`Seleccionar firma ${signature.alias}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleSignatureSelection(signature.id)
                }
              }}
            >
              {/* Selection indicator */}
              {selectedSignatures.has(signature.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Signature preview */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={signature.imageUrl || '/placeholder.svg'}
                  alt={signature.alias}
                  className="w-16 h-8 object-contain border rounded bg-white"
                />
                <div className="flex-1 min-w-0">
                  {editingId === signature.id ? (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingAlias}
                        onChange={(e) => setEditingAlias(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveAlias()
                          if (e.key === 'Escape') cancelEditing()
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="outline" onClick={saveAlias}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm truncate">
                        {signature.alias}
                      </p>
                      <p className="text-xs text-gray-500">
                        {signature.dateAdded}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(signature)
                  }}
                  className="text-xs"
                >
                  Renombrar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSignature(signature.id)
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : signatures.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>
            No hay firmas guardadas. Sube tu primera firma arrastrando una
            imagen.
          </p>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron firmas que coincidan con "{searchTerm}"</p>
        </div>
      )}

      {/* Selected Signatures Tray */}
      {selectedSignatures.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md w-full mx-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              Firmas seleccionadas: {selectedSignatures.size}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedSignatures(new Set())}
              aria-label="Limpiar selección"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected signatures thumbnails */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {signatures
              .filter((sig) => selectedSignatures.has(sig.id))
              .map((signature) => (
                <div key={signature.id} className="relative flex-shrink-0">
                  <img
                    src={signature.imageUrl || '/placeholder.svg'}
                    alt={signature.alias}
                    className="w-12 h-6 object-contain border rounded bg-gray-50"
                  />
                  <button
                    onClick={() => toggleSignatureSelection(signature.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    aria-label={`Quitar ${signature.alias} de la selección`}
                  >
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
          </div>

          <Button
            onClick={applySelectedSignatures}
            className="w-full"
            disabled={selectedSignatures.size === 0}
          >
            Aplicar al documento
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ModoHorizontalPage() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>({
    name: 'Documento.pdf',
    size: '100 MB',
    pages: 10,
  })
  const [availableSignatures, setAvailableSignatures] = useState<Signature[]>(
    []
  )
  const [appliedSignatures, setAppliedSignatures] = useState<
    AppliedSignature[]
  >([])
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(
    null
  )
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)

  // Simular firmas guardadas en localStorage
  useEffect(() => {
    const mockSignatures: Signature[] = [
      {
        id: '1',
        name: 'Firma Principal',
        imageUrl: '/placeholder.svg?height=60&width=120',
      },
      {
        id: '2',
        name: 'Firma Secundaria',
        imageUrl: '/placeholder.svg?height=60&width=120',
      },
      {
        id: '3',
        name: 'Iniciales',
        imageUrl: '/placeholder.svg?height=40&width=80',
      },
    ]
    setAvailableSignatures(mockSignatures)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPdfFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        pages: Math.floor(Math.random() * 20) + 5, // Simular páginas
      })
    }
  }

  const addSignatureToDocument = (signature: Signature) => {
    const newAppliedSignature: AppliedSignature = {
      ...signature,
      x: 50,
      y: 80,
      scale: 100,
      rotation: 0,
      opacity: 100,
      configured: false,
    }
    setAppliedSignatures([...appliedSignatures, newAppliedSignature])
  }

  const removeAppliedSignature = (id: string) => {
    setAppliedSignatures(appliedSignatures.filter((sig) => sig.id !== id))
    if (activeSignatureId === id) {
      setActiveSignatureId(null)
    }
  }

  const updateSignatureConfig = (
    id: string,
    updates: Partial<AppliedSignature>
  ) => {
    setAppliedSignatures(
      appliedSignatures.map((sig) =>
        sig.id === id ? { ...sig, ...updates, configured: true } : sig
      )
    )
  }

  const activeSignature = appliedSignatures.find(
    (sig) => sig.id === activeSignatureId
  )
  const allSignaturesConfigured =
    appliedSignatures.length > 0 &&
    appliedSignatures.every((sig) => sig.configured)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modo Masivo Vertical
          </h1>
          <p className="text-gray-600">
            Firma automáticamente todas las hojas A4 verticales de tu documento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda - Panel de Control */}
          <div className="space-y-6">
            {/* Etapa 1: Subida de PDF */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  Subir documento PDF
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!pdfFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Arrastra tu PDF aquí o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload">
                      <Button className="cursor-pointer">
                        Seleccionar PDF
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {pdfFile.name}
                        </p>
                        <p className="text-sm text-green-700">
                          {pdfFile.size} • {pdfFile.pages} páginas
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById('pdf-upload-change')?.click()
                        }
                      >
                        Cambiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPdfFile(null)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload-change"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Etapa 2: Galería de firmas (solo si hay PDF) */}
            {pdfFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    Galería de firmas
                  </CardTitle>
                  <CardDescription>
                    Selecciona las firmas que se aplicarán a todas las páginas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SignatureGallery
                    onSignaturesSelected={(signatures) => {
                      // Clear existing applied signatures and add new ones
                      const newAppliedSignatures = signatures.map((sig) => ({
                        ...sig,
                        x: 50,
                        y: 80,
                        scale: 100,
                        rotation: 0,
                        opacity: 100,
                        configured: false,
                      }))
                      setAppliedSignatures(newAppliedSignatures)
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Etapa 3: Firmas aplicadas (solo si hay firmas seleccionadas) */}
            {appliedSignatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    Firmas aplicadas
                  </CardTitle>
                  <CardDescription>
                    Configura la posición y propiedades de cada firma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appliedSignatures.map((signature) => (
                      <div
                        key={signature.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={signature.imageUrl || '/placeholder.svg'}
                            alt={signature.name}
                            className="w-12 h-6 object-contain border rounded"
                          />
                          <div>
                            <span className="font-medium">
                              {signature.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              {signature.configured ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-100 text-green-800"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Configurada
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Pendiente</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={
                              activeSignatureId === signature.id
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => setActiveSignatureId(signature.id)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAppliedSignature(signature.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 4: Configuración de firma activa */}
            {activeSignature && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    Configurando: {activeSignature.name}
                  </CardTitle>
                  <CardDescription>
                    Ajusta la posición y propiedades de la firma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Posición X: {activeSignature.x}%
                    </label>
                    <Slider
                      value={[activeSignature.x]}
                      onValueChange={([value]) =>
                        updateSignatureConfig(activeSignature.id, { x: value })
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Posición Y: {activeSignature.y}%
                    </label>
                    <Slider
                      value={[activeSignature.y]}
                      onValueChange={([value]) =>
                        updateSignatureConfig(activeSignature.id, { y: value })
                      }
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Escala: {activeSignature.scale}%
                    </label>
                    <Slider
                      value={[activeSignature.scale]}
                      onValueChange={([value]) =>
                        updateSignatureConfig(activeSignature.id, {
                          scale: value,
                        })
                      }
                      min={25}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rotación: {activeSignature.rotation}°
                    </label>
                    <Slider
                      value={[activeSignature.rotation]}
                      onValueChange={([value]) =>
                        updateSignatureConfig(activeSignature.id, {
                          rotation: value,
                        })
                      }
                      min={-45}
                      max={45}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Opacidad: {activeSignature.opacity}%
                    </label>
                    <Slider
                      value={[activeSignature.opacity]}
                      onValueChange={([value]) =>
                        updateSignatureConfig(activeSignature.id, {
                          opacity: value,
                        })
                      }
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Etapa 5: Acción final */}
            {appliedSignatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      5
                    </div>
                    Finalizar proceso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!allSignaturesConfigured ? (
                    <div className="text-center p-4">
                      <p className="text-gray-600 mb-4">
                        Aún debes configurar todas las firmas antes de continuar
                      </p>
                      <Button disabled className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF firmado
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-green-600 mb-4 font-medium">
                        ✅ Todas las firmas están configuradas
                      </p>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF firmado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna Derecha - Previsualización */}
          <div className="space-y-4">
            {pdfFile ? (
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Previsualización
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setZoomLevel(Math.max(50, zoomLevel - 25))
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">
                        {zoomLevel}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setZoomLevel(Math.min(200, zoomLevel + 25))
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Esta firma se aplicará a todas las hojas A4 verticales del
                    documento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
                    style={{ aspectRatio: '210/297' }}
                  >
                    {/* Simulación de contenido del PDF */}
                    <div className="absolute inset-4 space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                    </div>

                    {/* Firmas superpuestas */}
                    {appliedSignatures.map((signature) => (
                      <div
                        key={signature.id}
                        className={`absolute transition-all duration-200 ${
                          activeSignatureId === signature.id
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : ''
                        }`}
                        style={{
                          left: `${signature.x}%`,
                          top: `${signature.y}%`,
                          transform: `translate(-50%, -50%) scale(${
                            signature.scale / 100
                          }) rotate(${signature.rotation}deg)`,
                          opacity: signature.opacity / 100,
                        }}
                      >
                        <img
                          src={signature.imageUrl || '/placeholder.svg'}
                          alt={signature.name}
                          className="w-20 h-10 object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  {pdfFile.pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {currentPage} de {pdfFile.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === pdfFile.pages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Sube un documento para previsualizar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
