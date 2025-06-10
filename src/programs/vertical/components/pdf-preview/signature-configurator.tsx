"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, useDragControls } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import {
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  Trash2,
  Undo,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  resetTransformAtom,
  setDraggingAtom,
  setResizingAtom,
  setRotatingAtom,
  signatureConfigPrimitiveAtom,
  transformStyleAtom,
  updateTransformAtom,
} from "../../store/pdf/signature_config";
import {
  appliedSignaturesActionsAtom,
  appliedSignaturesPrimitiveAtom,
} from "../../store/signatures/applied_signatures";

export default function SignatureConfigurator() {
  // Referencias y estado local
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [startRotation, setStartRotation] = useState(0);
  const [startScale, setStartScale] = useState(100);

  // Átomos
  const [config] = useAtom(signatureConfigPrimitiveAtom);
  const transformStyle = useAtomValue(transformStyleAtom);
  const [appliedSignatures] = useAtom(appliedSignaturesPrimitiveAtom);
  const [, dispatchSignatureAction] = useAtom(appliedSignaturesActionsAtom);

  const [, updateTransform] = useAtom(updateTransformAtom);
  const [, resetTransform] = useAtom(resetTransformAtom);
  const [, setDragging] = useAtom(setDraggingAtom);
  const [, setResizing] = useAtom(setResizingAtom);
  const [, setRotating] = useAtom(setRotatingAtom);

  // Obtener la firma activa
  const activeSignature = appliedSignatures.signatures.find(
    (sig) => sig.id === appliedSignatures.activeSignatureId,
  );

  if (!activeSignature) return null;

  // Handlers para transformaciones
  const handleDragStart = () => {
    setIsDragging(true);
    setDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragging(false);
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    setStartRotation(config.transform.rotation);
    setRotating(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

    const handleRotateMove = (e: PointerEvent) => {
      const angle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

      const rotation = startRotation + (angle - startAngle);
      updateTransform({ rotation });
    };

    const handleRotateEnd = () => {
      setRotating(false);
      window.removeEventListener("pointermove", handleRotateMove);
      window.removeEventListener("pointerup", handleRotateEnd);
    };

    window.addEventListener("pointermove", handleRotateMove);
    window.addEventListener("pointerup", handleRotateEnd);
  };

  const handleScaleStart = (e: React.PointerEvent) => {
    setStartScale(config.transform.scale);
    setResizing(true);

    const startY = e.clientY;

    const handleScaleMove = (e: PointerEvent) => {
      const deltaY = startY - e.clientY;
      const scale = Math.max(10, Math.min(200, startScale + deltaY));
      updateTransform({ scale });
    };

    const handleScaleEnd = () => {
      setResizing(false);
      window.removeEventListener("pointermove", handleScaleMove);
      window.removeEventListener("pointerup", handleScaleEnd);
    };

    window.addEventListener("pointermove", handleScaleMove);
    window.addEventListener("pointerup", handleScaleEnd);
  };

  const handleOpacityChange = (value: number) => {
    updateTransform({ opacity: value });
  };

  const handleReset = () => {
    resetTransform();
  };

  const handleRemove = () => {
    dispatchSignatureAction({
      type: "REMOVE",
      payload: activeSignature.id,
    });
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      style={{
        ...transformStyle,
        touchAction: "none",
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
          src={activeSignature.sourceSignature.data || ""}
          alt="Firma"
          className="h-auto max-w-full select-none"
          draggable={false}
        />

        {/* Controles de transformación */}
        <div className="pointer-events-auto absolute -top-12 left-1/2 flex -translate-x-1/2 items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleReset}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restablecer transformaciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
            <Move className="h-4 w-4 text-gray-400" />
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
                  <Trash2 className="h-4 w-4" />
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
          className="pointer-events-auto absolute -top-4 left-1/2 h-8 w-8 -translate-x-1/2 cursor-pointer"
          onPointerDown={handleRotateStart}
        >
          <RotateCcw className="h-4 w-4" />
        </div>

        {/* Control de escala */}
        <div
          className="pointer-events-auto absolute right-0 -bottom-4 h-8 w-8 translate-x-1/2 cursor-pointer"
          onPointerDown={handleScaleStart}
        >
          {config.transform.scale > 100 ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </div>
      </motion.div>
    </div>
  );
}
