'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useAtom } from 'jotai'
import {
  activeSignatureAtom,
  appliedSignaturesActionsAtom,
} from '../store/signatures/applied_signatures'

export default function ConfiguracionFirma() {
  const [activeSignature] = useAtom(activeSignatureAtom)
  const [, setAppliedActions] = useAtom(appliedSignaturesActionsAtom)

  if (!activeSignature) return null

  const handleConfigUpdate = (
    key: 'x' | 'y' | 'scale' | 'rotation' | 'opacity',
    value: number
  ) => {
    setAppliedActions({
      type: 'UPDATE_CONFIG',
      payload: {
        id: activeSignature.id,
        config: { [key]: value },
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            4
          </div>
          Configurando: {activeSignature.sourceSignature.alias}
        </CardTitle>
        <CardDescription>
          Ajusta la posición y propiedades de la firma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Posición X: {activeSignature.config.x}%
          </label>
          <Slider
            value={[activeSignature.config.x]}
            onValueChange={([value]) => handleConfigUpdate('x', value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Posición Y: {activeSignature.config.y}%
          </label>
          <Slider
            value={[activeSignature.config.y]}
            onValueChange={([value]) => handleConfigUpdate('y', value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Escala: {activeSignature.config.scale}%
          </label>
          <Slider
            value={[activeSignature.config.scale]}
            onValueChange={([value]) => handleConfigUpdate('scale', value)}
            min={25}
            max={200}
            step={5}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Rotación: {activeSignature.config.rotation}°
          </label>
          <Slider
            value={[activeSignature.config.rotation]}
            onValueChange={([value]) => handleConfigUpdate('rotation', value)}
            min={-45}
            max={45}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Opacidad: {activeSignature.config.opacity}%
          </label>
          <Slider
            value={[activeSignature.config.opacity]}
            onValueChange={([value]) => handleConfigUpdate('opacity', value)}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
