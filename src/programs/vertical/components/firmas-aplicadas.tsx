'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, X, Check } from 'lucide-react'
import { useAtom } from 'jotai'
import {
  appliedSignaturesPrimitiveAtom,
  appliedSignaturesActionsAtom,
} from '../store/signatures/applied_signatures'

export default function FirmasAplicadas() {
  const [appliedSignaturesState] = useAtom(appliedSignaturesPrimitiveAtom)
  const [, setAppliedActions] = useAtom(appliedSignaturesActionsAtom)

  const { signatures, activeSignatureId } = appliedSignaturesState

  const handleSetActive = (id: string) => {
    setAppliedActions({
      type: 'SET_ACTIVE',
      payload: id,
    })
  }

  const handleRemoveSignature = (id: string) => {
    setAppliedActions({
      type: 'REMOVE',
      payload: id,
    })
  }

  if (signatures.length === 0) return null

  return (
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
          {signatures.map((signature) => (
            <div
              key={signature.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={signature.sourceSignature.data}
                  alt={signature.sourceSignature.alias}
                  className="w-12 h-6 object-contain border rounded"
                />
                <div>
                  <span className="font-medium">
                    {signature.sourceSignature.alias}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {signature.isConfigured ? (
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
                    activeSignatureId === signature.id ? 'default' : 'outline'
                  }
                  onClick={() => handleSetActive(signature.id)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSignature(signature.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
