"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import SubirPdf from "./components/subir-pdf";
import { useAtom } from "jotai";
import { pdfStateAtom } from "./store/pdf/input_pdf";
import GaleriaFirmas from "./components/galeria-firmas";
import { SignatureState } from "./store/signatures/input_signature";
import FirmasAplicadas from "./components/firmas-aplicadas";
import {
  activeSignatureAtom,
  appliedSignaturesAtom,
} from "./store/signatures/applied_signatures";
import ConfiguracionFirma from "./components/configuracion-firma";
import ButtonAction from "./components/button-action";
import PDFViewer from "./components/pdf-preview/pdf-viewer";

interface Signature {
  id: string;
  name: string;
  imageUrl: string;
}

interface AppliedSignature extends Signature {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  configured: boolean;
}

interface PDFFile {
  name: string;
  size: string;
  pages: number;
}

export default function ModoVerticalPage() {
  const [pdfState, setPdfState] = useAtom(pdfStateAtom);
  const [availableSignatures, setAvailableSignatures] = useState<Signature[]>(
    [],
  );
  const [appliedSignatures, setAppliedSignatures] = useState<
    AppliedSignature[]
  >([]);

  const [appliedSignaturesJotai] = useAtom(appliedSignaturesAtom);
  const [activeSignatureJotai] = useAtom(activeSignatureAtom);
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Simular firmas guardadas en localStorage
  useEffect(() => {
    const mockSignatures: Signature[] = [
      {
        id: "1",
        name: "Firma Principal",
        imageUrl: "/placeholder.svg?height=60&width=120",
      },
      {
        id: "2",
        name: "Firma Secundaria",
        imageUrl: "/placeholder.svg?height=60&width=120",
      },
      {
        id: "3",
        name: "Iniciales",
        imageUrl: "/placeholder.svg?height=40&width=80",
      },
    ];
    setAvailableSignatures(mockSignatures);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      });
    }
  };

  const addSignatureToDocument = (signature: Signature) => {
    const newAppliedSignature: AppliedSignature = {
      ...signature,
      x: 50,
      y: 80,
      scale: 100,
      rotation: 0,
      opacity: 100,
      configured: false,
    };
    setAppliedSignatures([...appliedSignatures, newAppliedSignature]);
  };

  const removeAppliedSignature = (id: string) => {
    setAppliedSignatures(appliedSignatures.filter((sig) => sig.id !== id));
    if (activeSignatureId === id) {
      setActiveSignatureId(null);
    }
  };

  const updateSignatureConfig = (
    id: string,
    updates: Partial<AppliedSignature>,
  ) => {
    setAppliedSignatures(
      appliedSignatures.map((sig) =>
        sig.id === id ? { ...sig, ...updates, configured: true } : sig,
      ),
    );
  };

  const activeSignature = appliedSignatures.find(
    (sig) => sig.id === activeSignatureId,
  );
  const allSignaturesConfigured =
    appliedSignatures.length > 0 &&
    appliedSignatures.every((sig) => sig.configured);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Modo Masivo Vertical
          </h1>
          <p className="text-gray-600">
            Firma automáticamente todas las hojas A4 verticales de tu documento
          </p>
        </div>

        <div className="grid h-[calc(100vh-150px)] grid-cols-1 gap-6 md:grid-cols-2">
          {/* Columna Izquierda - Panel de Control */}
          <div className="space-y-6 overflow-y-auto">
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
                {/* <Card>
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
                </Card> */}
              </div>
            )}

            {/* Etapa 3: Firmas aplicadas (solo si hay firmas seleccionadas) */}
            {appliedSignaturesJotai.length > 0 && (
              <div>
                <FirmasAplicadas />
                {/* <Card>
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
                              onClick={() =>
                                removeAppliedSignature(signature.id)
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            )}

            {/* Etapa 4: Configuración de firma activa */}
            {activeSignatureJotai && (
              <div>
                <ConfiguracionFirma />
                {/* <Card>
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
                          updateSignatureConfig(activeSignature.id, {
                            x: value,
                          })
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
                          updateSignatureConfig(activeSignature.id, {
                            y: value,
                          })
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
                </Card> */}
              </div>
            )}

            {/* Etapa 5: Acción final */}
            {appliedSignaturesJotai.length > 0 && (
              <div>
                <ButtonAction />
                {/* <Card>
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
                          Aún debes configurar todas las firmas antes de
                          continuar
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
                </Card> */}
              </div>
            )}
          </div>

          {/* Columna Derecha - Previsualización */}

          <div className="space-y-4 overflow-y-auto">
            <PDFViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
