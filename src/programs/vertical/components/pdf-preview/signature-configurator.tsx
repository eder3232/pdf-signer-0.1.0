'use client'

import { useAtom, useAtomValue } from 'jotai'
import { useRef, useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from '@/components/ui/slider'
import {
  Move,
  RotateCcw,
  Maximize2,
  Minimize2,
  Trash2,
  Undo,
} from 'lucide-react'
import {
  signatureConfigPrimitiveAtom,
  updateTransformAtom,
  resetTransformAtom,
  setDraggingAtom,
  setResizingAtom,
  setRotatingAtom,
  transformStyleAtom,
} from '../../store/pdf/signature_config'
import {
  appliedSignaturesPrimitiveAtom,
  appliedSignaturesActionsAtom,
} from '../../store/signatures/applied_signatures'

export default function SignatureConfigurator() {
  // Referencias y estado local
  const containerRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const [startRotation, setStartRotation] = useState(0)
  const [startScale, setStartScale] = useState(100)

  // Átomos
  const [config] = useAtom(signatureConfigPrimitiveAtom)
  const transformStyle = useAtomValue(transformStyleAtom)
  const [appliedSignatures] = useAtom(appliedSignaturesPrimitiveAtom)
  const [, dispatchSignatureAction] = useAtom(appliedSignaturesActionsAtom)

  const [, updateTransform] = useAtom(updateTransformAtom)
  const [, resetTransform] = useAtom(resetTransformAtom)
  const [, setDragging] = useAtom(setDraggingAtom)
  const [, setResizing] = useAtom(setResizingAtom)
  const [, setRotating] = useAtom(setRotatingAtom)

  // Obtener la firma activa
  const activeSignature = appliedSignatures.signatures.find(
    (sig) => sig.id === appliedSignatures.activeSignatureId
  )

  if (!activeSignature) return null

  // Handlers para transformaciones
  const handleDragStart = () => {
    setIsDragging(true)
    setDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDragging(false)
  }

  const handleRotateStart = (e: React.PointerEvent) => {
    setStartRotation(config.transform.rotation)
    setRotating(true)

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

    const handleRotateMove = (e: PointerEvent) => {
      const angle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

      const rotation = startRotation + (angle - startAngle)
      updateTransform({ rotation })
    }

    const handleRotateEnd = () => {
      setRotating(false)
      window.removeEventListener('pointermove', handleRotateMove)
      window.removeEventListener('pointerup', handleRotateEnd)
    }

    window.addEventListener('pointermove', handleRotateMove)
    window.addEventListener('pointerup', handleRotateEnd)
  }

  const handleScaleStart = (e: React.PointerEvent) => {
    setStartScale(config.transform.scale)
    setResizing(true)

    const startY = e.clientY

    const handleScaleMove = (e: PointerEvent) => {
      const deltaY = startY - e.clientY
      const scale = Math.max(10, Math.min(200, startScale + deltaY))
      updateTransform({ scale })
    }

    const handleScaleEnd = () => {
      setResizing(false)
      window.removeEventListener('pointermove', handleScaleMove)
      window.removeEventListener('pointerup', handleScaleEnd)
    }

    window.addEventListener('pointermove', handleScaleMove)
    window.addEventListener('pointerup', handleScaleEnd)
  }

  const handleOpacityChange = (value: number) => {
    updateTransform({ opacity: value })
  }

  const handleReset = () => {
    resetTransform()
  }

  const handleRemove = () => {
    dispatchSignatureAction({
      type: 'REMOVE',
      payload: activeSignature.id,
    })
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        ...transformStyle,
        touchAction: 'none',
      }}
    >
      {/* Firma */}
      <motion.div
        className="relative"
        drag
        dragControls={dragControls}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <img
          src={activeSignature.sourceSignature.data || ''}
          alt="Firma"
          className="max-w-full h-auto select-none"
          draggable={false}
        />

        {/* Controles de transformación */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleReset}
                >
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restablecer transformaciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
            <Move className="w-4 h-4 text-gray-400" />
            <Slider
              value={[config.transform.opacity]}
              onValueChange={([value]) => handleOpacityChange(value)}
              min={20}
              max={100}
              step={1}
              className="w-24"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quitar firma</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Control de rotación */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 cursor-pointer pointer-events-auto"
          onPointerDown={handleRotateStart}
        >
          <RotateCcw className="w-4 h-4" />
        </div>

        {/* Control de escala */}
        <div
          className="absolute -bottom-4 right-0 translate-x-1/2 w-8 h-8 cursor-pointer pointer-events-auto"
          onPointerDown={handleScaleStart}
        >
          {config.transform.scale > 100 ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </div>
      </motion.div>
    </div>
  )
}
