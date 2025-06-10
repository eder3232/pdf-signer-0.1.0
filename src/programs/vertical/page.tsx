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
import SubirPdf from './components/subir-pdf'
import { useAtom } from 'jotai'
import { pdfStateAtom } from './store/pdf/input_pdf'
import GaleriaFirmas from './components/galeria-firmas'
import { SignatureState } from './store/signatures/input_signature'

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

export default function ModoVerticalPage() {
  const [pdfState, setPdfState] = useAtom(pdfStateAtom)
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
      setPdfState({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        pageCount: Math.floor(Math.random() * 20) + 5, // Simular páginas
        loaded: false,
        error: null,
        uploadDate: new Date(),
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

            <SubirPdf />
            {/* <Card>
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
            </Card> */}

            {/* Etapa 2: Galería de firmas (solo si hay PDF) */}
            {pdfState.file && (
              <div>
                <GaleriaFirmas />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      Galería de firmas
                    </CardTitle>
                    <CardDescription>
                      Selecciona las firmas que deseas aplicar al documento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">
                      {availableSignatures.map((signature) => (
                        <div
                          key={signature.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={signature.imageUrl || '/placeholder.svg'}
                              alt={signature.name}
                              className="w-16 h-8 object-contain border rounded"
                            />
                            <span className="font-medium">
                              {signature.name}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => addSignatureToDocument(signature)}
                              disabled={appliedSignatures.some(
                                (sig) => sig.id === signature.id
                              )}
                            >
                              {appliedSignatures.some(
                                (sig) => sig.id === signature.id
                              )
                                ? 'Agregada'
                                : 'Usar en documento'}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
            {pdfState ? (
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

                  {pdfState.pageCount && pdfState.pageCount > 1 && (
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
                        Página {currentPage} de {pdfState.pageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === pdfState.pageCount}
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
