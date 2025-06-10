"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useAtom } from "jotai";
import {
  activeSignatureAtom,
  appliedSignaturesActionsAtom,
  type RandomnessConfig,
} from "../store/signatures/applied_signatures";
import { useState } from "react";

export default function ConfiguracionFirma() {
  const [activeSignature] = useAtom(activeSignatureAtom);
  const [, setAppliedActions] = useAtom(appliedSignaturesActionsAtom);
  const [isRandomnessOpen, setIsRandomnessOpen] = useState(false);

  if (!activeSignature) return null;

  const handleConfigUpdate = (
    key: "x" | "y" | "width" | "rotation" | "opacity",
    value: number,
  ) => {
    setAppliedActions({
      type: "UPDATE_CONFIG",
      payload: {
        id: activeSignature.id,
        config: { [key]: value },
      },
    });
  };

  const handleRandomnessUpdate = (
    key: keyof RandomnessConfig,
    value: number,
  ) => {
    setAppliedActions({
      type: "UPDATE_CONFIG",
      payload: {
        id: activeSignature.id,
        config: {
          randomness: {
            [key]: value,
          },
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
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
          <label className="mb-2 block text-sm font-medium">
            Posición X: {activeSignature.config.x}%
          </label>
          <Slider
            value={[activeSignature.config.x]}
            onValueChange={([value]) => handleConfigUpdate("x", value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Posición Y: {activeSignature.config.y}%
          </label>
          <Slider
            value={[activeSignature.config.y]}
            onValueChange={([value]) => handleConfigUpdate("y", value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Ancho: {activeSignature.config.width}cm
          </label>
          <Slider
            value={[activeSignature.config.width]}
            onValueChange={([value]) => handleConfigUpdate("width", value)}
            min={1}
            max={8}
            step={0.1}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Rotación: {activeSignature.config.rotation}°
          </label>
          <Slider
            value={[activeSignature.config.rotation]}
            onValueChange={([value]) => handleConfigUpdate("rotation", value)}
            min={-45}
            max={45}
            step={1}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            Opacidad: {activeSignature.config.opacity}%
          </label>
          <Slider
            value={[activeSignature.config.opacity]}
            onValueChange={([value]) => handleConfigUpdate("opacity", value)}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <Collapsible
          open={isRandomnessOpen}
          onOpenChange={setIsRandomnessOpen}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-between p-1"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Configuración de aleatoriedad
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {isRandomnessOpen ? "Ocultar" : "Mostrar"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variación Posición X: ±
                    {activeSignature.config.randomness.positionXVariance}%
                  </label>
                  <Slider
                    value={[
                      activeSignature.config.randomness.positionXVariance,
                    ]}
                    onValueChange={([value]) =>
                      handleRandomnessUpdate("positionXVariance", value)
                    }
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variación Posición Y: ±
                    {activeSignature.config.randomness.positionYVariance}%
                  </label>
                  <Slider
                    value={[
                      activeSignature.config.randomness.positionYVariance,
                    ]}
                    onValueChange={([value]) =>
                      handleRandomnessUpdate("positionYVariance", value)
                    }
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variación Rotación: ±
                    {activeSignature.config.randomness.rotationVariance}°
                  </label>
                  <Slider
                    value={[activeSignature.config.randomness.rotationVariance]}
                    onValueChange={([value]) =>
                      handleRandomnessUpdate("rotationVariance", value)
                    }
                    max={15}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variación Opacidad: ±
                    {activeSignature.config.randomness.opacityVariance}%
                  </label>
                  <Slider
                    value={[activeSignature.config.randomness.opacityVariance]}
                    onValueChange={([value]) =>
                      handleRandomnessUpdate("opacityVariance", value)
                    }
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Variación Ancho: ±
                    {activeSignature.config.randomness.widthVariance}cm
                  </label>
                  <Slider
                    value={[activeSignature.config.randomness.widthVariance]}
                    onValueChange={([value]) =>
                      handleRandomnessUpdate("widthVariance", value)
                    }
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
