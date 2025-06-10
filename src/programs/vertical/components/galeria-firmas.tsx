'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAtom } from 'jotai'
import {
  PenLine,
  Plus,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Upload,
  Info,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useRef } from 'react'
import {
  signaturesCatalogPrimitiveAtom,
  signaturesCatalogActionsAtom,
  filteredSignaturesAtom,
  CatalogSignature,
} from '../store/signatures/signatures_catalog'
import {
  appliedSignaturesActionsAtom,
  appliedSignaturesPrimitiveAtom,
} from '../store/signatures/applied_signatures'
import {
  saveToCatalogAtom,
  signatureStateAtom,
} from '../store/signatures/signatures_state'
import { SIGNATURE_RECOMMENDATIONS } from '../store/signatures/input_signature'

// Función auxiliar para generar warnings
const generateWarnings = (width: number, height: number, fileType: string) => {
  return {
    smallDimensions:
      width < SIGNATURE_RECOMMENDATIONS.MIN_WIDTH ||
      height < SIGNATURE_RECOMMENDATIONS.MIN_HEIGHT,
    notPNG: fileType !== SIGNATURE_RECOMMENDATIONS.PREFERRED_FORMAT,
  }
}

export default function GaleriaFirmas() {
  const [catalog, setCatalog] = useAtom(signaturesCatalogPrimitiveAtom)
  const [filteredSignatures] = useAtom(filteredSignaturesAtom)
  const [, setCatalogActions] = useAtom(signaturesCatalogActionsAtom)
  const [, setAppliedActions] = useAtom(appliedSignaturesActionsAtom)
  const [, saveAndApplySignature] = useAtom(saveToCatalogAtom)
  const [, setSignatureState] = useAtom(signatureStateAtom)
  const [appliedSignatures] = useAtom(appliedSignaturesPrimitiveAtom)

  //   console.log(appliedSignatures)
  console.log(filteredSignatures)

  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle')
  const [dragActive, setDragActive] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingAlias, setEditingAlias] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const processImage = async (file: File) => {
    try {
      // Crear URL para la imagen
      const imageUrl = URL.createObjectURL(file)

      // Cargar la imagen para obtener dimensiones
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // Convertir a base64
      const reader = new FileReader()
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      // Generar warnings basados en las dimensiones y tipo de archivo
      const warnings = generateWarnings(img.width, img.height, file.type)

      const newSignature = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        alias: file.name.replace(/\.[^/.]+$/, ''),
        data: base64Data,
        fileType: file.type as 'image/png' | 'image/jpeg',
        size: file.size,
        metadata: {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        },
        warnings,
        dateAdded: new Date().toISOString().split('T')[0],
      }

      setCatalogActions({
        type: 'ADD',
        payload: newSignature,
      })

      setUploadStatus('success')
      setTimeout(() => setUploadStatus('idle'), 3000)
    } catch (error) {
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
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

    for (const file of imageFiles) {
      await processImage(file)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadStatus('uploading')

    for (const file of files) {
      await processImage(file)
    }
  }

  const startEditing = (signature: CatalogSignature) => {
    setEditingId(signature.id)
    setEditingAlias(signature.alias)
  }

  const saveAlias = () => {
    if (!editingId) return

    const signature = catalog.signatures.find((sig) => sig.id === editingId)
    if (!signature) return

    setCatalogActions({
      type: 'UPDATE',
      payload: { ...signature, alias: editingAlias },
    })

    setEditingId(null)
    setEditingAlias('')
  }

  const removeSignature = (id: string) => {
    setCatalogActions({
      type: 'REMOVE',
      payload: id,
    })
  }

  const useSignature = (signature: CatalogSignature) => {
    setAppliedActions({
      type: 'ADD',
      payload: signature,
    })
  }

  const removeAppliedSignature = (signature: CatalogSignature) => {
    setAppliedActions({
      type: 'REMOVE',
      payload: signature.id,
    })
  }

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
    <div>
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
        <CardContent className="space-y-6">
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
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    aria-label="Seleccionar archivos de imagen para firmas"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG hasta 2MB</p>
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
          {catalog.signatures.length > 0 && (
            <div>
              <input
                type="text"
                placeholder="Buscar firmas por nombre..."
                value={catalog.searchTerm}
                onChange={(e) =>
                  setCatalogActions({
                    type: 'SET_SEARCH',
                    payload: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Buscar firmas"
              />
            </div>
          )}

          {/* Signatures Grid */}
          {filteredSignatures.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
              {filteredSignatures.map((signature) => (
                <div
                  key={signature.id}
                  className="group relative p-4 border rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* Signature preview */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={signature.data || '/placeholder.svg'}
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
                              if (e.key === 'Escape') {
                                setEditingId(null)
                                setEditingAlias('')
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={saveAlias}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditingAlias('')
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-sm truncate">
                            {signature.alias}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">
                              {signature.dateAdded}
                            </span>
                            {signature.metadata?.width &&
                              signature.metadata?.height && (
                                <span className="text-gray-500">
                                  {signature.metadata.width}x
                                  {signature.metadata.height}px
                                </span>
                              )}
                            {(signature.warnings?.notPNG ||
                              signature.warnings?.smallDimensions) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-yellow-600 cursor-help">
                                      <Info className="w-3 h-3" />
                                      {signature.warnings?.notPNG && (
                                        <span>JPG</span>
                                      )}
                                      {signature.warnings?.smallDimensions && (
                                        <span>Dimensiones pequeñas</span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="space-y-2 text-sm">
                                      <p className="font-medium">
                                        Recomendaciones para firmas:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {signature.warnings?.notPNG && (
                                          <li className="text-yellow-700">
                                            Preferiblemente usar formato PNG
                                            para mejor calidad
                                          </li>
                                        )}
                                        {signature.warnings
                                          ?.smallDimensions && (
                                          <li className="text-yellow-700">
                                            Dimensiones mínimas recomendadas:{' '}
                                            {
                                              SIGNATURE_RECOMMENDATIONS.MIN_WIDTH
                                            }
                                            x
                                            {
                                              SIGNATURE_RECOMMENDATIONS.MIN_HEIGHT
                                            }
                                            px
                                          </li>
                                        )}
                                        <li className="text-gray-600">
                                          Tamaño máximo:{' '}
                                          {
                                            SIGNATURE_RECOMMENDATIONS.MAX_SIZE_MB
                                          }
                                          MB
                                        </li>
                                      </ul>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warnings */}
                  {(signature.warnings?.notPNG ||
                    signature.warnings?.smallDimensions) && (
                    <div className="flex gap-2 mb-3">
                      {signature.warnings.notPNG && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          No es PNG
                        </Badge>
                      )}
                      {signature.warnings.smallDimensions && (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Dimensiones pequeñas
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {appliedSignatures.signatures.some(
                      (sig) => sig.sourceSignature.id === signature.id
                    ) ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeAppliedSignature(signature)}
                        className="flex-1 gap-2"
                      >
                        <X className="w-4 h-4" />
                        Quitar del documento
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => useSignature(signature)}
                        className="flex-1 gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Usar en documento
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(signature)}
                    >
                      <PenLine className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSignature(signature.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : catalog.signatures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay firmas guardadas. Sube tu primera firma.</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>
                No se encontraron firmas que coincidan con "{catalog.searchTerm}
                "
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
