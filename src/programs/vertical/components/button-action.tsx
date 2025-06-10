import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAtom, useAtomValue } from "jotai";
import { Download, Loader2 } from "lucide-react";
import {
  allSignaturesConfiguredAtom,
  appliedSignaturesAtom,
} from "../store/signatures/applied_signatures";
import { pdfStateAtom } from "../store/pdf/input_pdf";
import { signPDF } from "../utils/pdf-signer";
import { useState } from "react";
import { toast } from "sonner";

export default function ButtonAction() {
  const [allSignaturesConfigured] = useAtom(allSignaturesConfiguredAtom);
  const signatures = useAtomValue(appliedSignaturesAtom);
  const pdfState = useAtomValue(pdfStateAtom);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!pdfState?.file || !allSignaturesConfigured) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      // Convertir el File a ArrayBuffer
      const pdfBytes = await pdfState.file.arrayBuffer();

      // Firmar el PDF
      const signedPdfBytes = await signPDF({
        pdfBytes,
        signatures,
        onProgress: (value) => setProgress(Math.round(value)),
      });

      // Crear un Blob con el PDF firmado
      const blob = new Blob([signedPdfBytes], { type: "application/pdf" });

      // Crear URL y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `firmado_${pdfState.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF firmado descargado correctamente");
    } catch (error) {
      console.error("Error al firmar el PDF:", error);
      toast.error("Error al firmar el PDF. Por favor, intenta de nuevo.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            5
          </div>
          Finalizar proceso
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!allSignaturesConfigured ? (
          <div className="p-4 text-center">
            <p className="mb-4 text-gray-600">
              Aún debes configurar todas las firmas antes de continuar
            </p>
            <Button disabled className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF firmado
            </Button>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="mb-4 font-medium text-green-600">
              ✅ Todas las firmas están configuradas
            </p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando... {progress}%
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF firmado
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
