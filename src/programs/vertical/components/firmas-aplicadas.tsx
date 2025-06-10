"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, X, Check } from "lucide-react";
import { useAtom } from "jotai";
import {
  appliedSignaturesPrimitiveAtom,
  appliedSignaturesActionsAtom,
} from "../store/signatures/applied_signatures";

export default function FirmasAplicadas() {
  const [appliedSignaturesState] = useAtom(appliedSignaturesPrimitiveAtom);
  const [, setAppliedActions] = useAtom(appliedSignaturesActionsAtom);

  const { signatures, activeSignatureId } = appliedSignaturesState;

  const handleSetActive = (id: string) => {
    setAppliedActions({
      type: "SET_ACTIVE",
      payload: id,
    });
  };

  const handleRemoveSignature = (id: string) => {
    setAppliedActions({
      type: "REMOVE",
      payload: id,
    });
  };

  if (signatures.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={signature.sourceSignature.data ?? ""}
                  alt={signature.sourceSignature.alias}
                  className="h-6 w-12 rounded border object-contain"
                />
                <div>
                  <span className="font-medium">
                    {signature.sourceSignature.alias}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    {signature.isConfigured ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        <Check className="mr-1 h-3 w-3" />
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
                    activeSignatureId === signature.id ? "default" : "outline"
                  }
                  onClick={() => handleSetActive(signature.id)}
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Configurar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveSignature(signature.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
