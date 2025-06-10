"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import {
  pdfPreviewPrimitiveAtom,
  setCurrentPageAtom,
  setDimensionsAtom,
  setTotalPagesAtom,
  setViewModeAtom,
  setZoomAtom,
  effectiveZoomAtom,
  canNavigateAtom,
  ViewMode,
} from "../../store/pdf/pdf_preview";
import { pdfStateAtom } from "../../store/pdf/input_pdf";
import {
  appliedSignaturesAtom,
  activeSignatureAtom,
  setActiveSignatureAtom,
} from "../../store/signatures/applied_signatures";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowLeftRight,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Configuración de worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Añadir estas constantes al inicio del archivo, después de las importaciones
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;

// Componente para mostrar cuando no hay PDF
function NoPDFMessage() {
  return (
    <Card className="flex h-96 items-center justify-center">
      <CardContent className="text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <p className="text-gray-500">Sube un documento para previsualizar</p>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar errores
function ErrorMessage({ message }: { message: string }) {
  return (
    <Card className="flex h-96 items-center justify-center">
      <CardContent className="text-center">
        <FileText className="mx-auto mb-4 h-16 w-16 text-red-300" />
        <p className="text-red-600">Error al cargar el PDF: {message}</p>
      </CardContent>
    </Card>
  );
}

export default function PDFViewer() {
  // 1. Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. Estado local
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 3. Átomos de lectura
  const pdfState = useAtomValue(pdfStateAtom);
  const pdfPreviewState = useAtomValue(pdfPreviewPrimitiveAtom);
  const effectiveZoom = useAtomValue(effectiveZoomAtom);
  const canNavigate = useAtomValue(canNavigateAtom);
  const appliedSignatures = useAtomValue(appliedSignaturesAtom);
  const activeSignature = useAtomValue(activeSignatureAtom);

  // 4. Átomos de escritura
  const setActiveSignature = useSetAtom(setActiveSignatureAtom);
  const setCurrentPage = useSetAtom(setCurrentPageAtom);
  const setTotalPages = useSetAtom(setTotalPagesAtom);
  const setDimensions = useSetAtom(setDimensionsAtom);
  const setZoom = useSetAtom(setZoomAtom);
  const setViewMode = useSetAtom(setViewModeAtom);

  // 5. Handlers
  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setTotalPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    [setTotalPages],
  );

  const handlePageLoadSuccess = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({
      width,
      height,
      naturalWidth: width,
      naturalHeight: height,
    });
  }, [setDimensions]);

  const handleError = useCallback((error: Error) => {
    console.error("Error loading PDF:", error);
    setError(error);
    setIsLoading(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(effectiveZoom + 10);
  }, [effectiveZoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(10, effectiveZoom - 10));
  }, [effectiveZoom, setZoom]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(Math.max(1, pdfPreviewState.currentPage - 1));
  }, [pdfPreviewState.currentPage, setCurrentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(
      Math.min(pdfPreviewState.totalPages, pdfPreviewState.currentPage + 1),
    );
  }, [pdfPreviewState.currentPage, pdfPreviewState.totalPages, setCurrentPage]);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
    },
    [setViewMode],
  );

  // Añadir este cálculo después de handlePageLoadSuccess
  const calculatePixelsPerCm = useCallback(() => {
    if (!containerRef.current) return 0;
    const pdfElement = containerRef.current.querySelector(".react-pdf__Page");
    if (!pdfElement) return 0;

    const { width } = pdfElement.getBoundingClientRect();
    return width / A4_WIDTH_CM; // píxeles por centímetro
  }, []);

  // Modificar el renderizado de las firmas
  const renderSignatures = () => {
    const pixelsPerCm = calculatePixelsPerCm();
    if (!pixelsPerCm) return null;

    return appliedSignatures.map((signature) => {
      const widthInPixels = signature.config.width * pixelsPerCm;
      const originalImage = new Image();
      originalImage.src = signature.sourceSignature.data || "";

      // Calculamos la altura manteniendo el aspect ratio
      const aspectRatio = originalImage.height / originalImage.width;
      const heightInPixels = widthInPixels * aspectRatio;

      return (
        <div
          key={signature.id}
          className={`absolute cursor-pointer transition-all duration-200 ${
            activeSignature?.id === signature.id
              ? "ring-2 ring-blue-500 ring-offset-2"
              : ""
          }`}
          style={{
            left: `${signature.config.x}%`,
            top: `${signature.config.y}%`,
            transform: `translate(-50%, -50%) rotate(${signature.config.rotation}deg)`,
            opacity: signature.config.opacity / 100,
            width: `${widthInPixels}px`,
            height: `${heightInPixels}px`,
          }}
          onClick={() => setActiveSignature(signature.id)}
        >
          <img
            src={signature.sourceSignature.data || ""}
            alt={signature.sourceSignature.name}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </div>
      );
    });
  };

  // 6. Renderizado condicional después de los hooks
  const renderContent = () => {
    if (!pdfState?.url) {
      return <NoPDFMessage />;
    }

    if (error) {
      return <ErrorMessage message={error.message} />;
    }

    return (
      <div className="flex h-auto flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!canNavigate.prev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {pdfPreviewState.currentPage} de{" "}
              {pdfPreviewState.totalPages || "?"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!canNavigate.next || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={effectiveZoom <= 10 || isLoading}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="w-16 text-center text-sm">
              {Math.round(effectiveZoom)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={effectiveZoom >= 500 || isLoading}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Select
              value={pdfPreviewState.viewMode}
              onValueChange={handleViewModeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fit-width">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span>Ajustar ancho</span>
                  </div>
                </SelectItem>
                <SelectItem value="fit-page">
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4" />
                    <span>Ajustar página</span>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <span>Personalizado</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-auto bg-neutral-100"
        >
          <div className="flex min-h-full items-center justify-center">
            <div className="relative">
              <Document
                file={pdfState.url}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleError}
                loading={
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                }
              >
                {isLoading ? (
                  <Skeleton className="h-[842px] w-[595px]" /> // Tamaño A4 por defecto
                ) : (
                  <Page
                    pageNumber={pdfPreviewState.currentPage}
                    scale={effectiveZoom / 100}
                    onLoadSuccess={handlePageLoadSuccess}
                    loading={<Skeleton className="h-[842px] w-[595px]" />}
                    error={
                      <div className="text-red-600">
                        Error al cargar la página
                      </div>
                    }
                  />
                )}
              </Document>

              {/* Firmas superpuestas */}
              {!isLoading && renderSignatures()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 7. Render final
  return renderContent();
}
