import { PDFDocument, degrees } from "pdf-lib";
import { AppliedSignature } from "../store/signatures/applied_signatures";

// Constantes para conversión
const A4_WIDTH_POINTS = 595.276; // Ancho A4 en puntos PDF
const A4_WIDTH_CM = 21; // Ancho A4 en centímetros
const POINTS_PER_CM = A4_WIDTH_POINTS / A4_WIDTH_CM;

interface SignPDFOptions {
  pdfBytes: ArrayBuffer;
  signatures: AppliedSignature[];
  onProgress?: (progress: number) => void;
}

/**
 * Genera un número aleatorio dentro de un rango
 * @param base Valor base
 * @param variance Variación máxima (±)
 * @param min Valor mínimo permitido
 * @param max Valor máximo permitido
 */
function getRandomValue(
  base: number,
  variance: number,
  min: number,
  max: number,
): number {
  const randomVariance = (Math.random() - 0.5) * 2 * variance;
  const value = base + randomVariance;
  return Math.min(Math.max(value, min), max);
}

/**
 * Convierte una cadena base64 a un Uint8Array
 * @param base64 Cadena base64 que puede incluir o no el prefijo data:image
 */
function base64ToBytes(base64: string): Uint8Array {
  // Remover el prefijo data:image si existe
  const base64Clean = base64.replace(/^data:image\/\w+;base64,/, "");
  return Uint8Array.from(atob(base64Clean), (c) => c.charCodeAt(0));
}

/**
 * Firma un PDF con las firmas proporcionadas
 * @param options Opciones para firmar el PDF
 * @returns Promise con los bytes del PDF firmado
 */
export async function signPDF({
  pdfBytes,
  signatures,
  onProgress = () => {},
}: SignPDFOptions): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const totalOperations = signatures.length * pages.length;
    let currentOperation = 0;

    for (const signature of signatures) {
      if (!signature.isConfigured || !signature.sourceSignature.data) {
        console.warn(
          `La firma ${signature.id} no está configurada o no tiene datos, se omitirá`,
        );
        continue;
      }

      const { randomness } = signature.config;

      try {
        const imageBytes = base64ToBytes(signature.sourceSignature.data);
        const image = await pdfDoc.embedPng(imageBytes);
        const imageAspectRatio = image.height / image.width;

        for (const page of pages) {
          const { width: pageWidth, height: pageHeight } = page.getSize();
          const pdfScaleFactor = pageWidth / A4_WIDTH_POINTS;

          // Usar la configuración de aleatoriedad específica de la firma
          const randomX = getRandomValue(
            (signature.config.x / 100) * pageWidth,
            (randomness.positionXVariance / 100) * pageWidth,
            0,
            pageWidth,
          );

          const randomY = getRandomValue(
            ((100 - signature.config.y) / 100) * pageHeight,
            (randomness.positionYVariance / 100) * pageHeight,
            0,
            pageHeight,
          );

          const widthInCm = getRandomValue(
            signature.config.width,
            randomness.widthVariance,
            0.5,
            15,
          );

          const widthInPoints = widthInCm * POINTS_PER_CM * pdfScaleFactor;
          const heightInPoints = widthInPoints * imageAspectRatio;

          const randomRotation = getRandomValue(
            signature.config.rotation,
            randomness.rotationVariance,
            -180,
            180,
          );

          const randomOpacity = getRandomValue(
            signature.config.opacity,
            randomness.opacityVariance,
            20,
            100,
          );

          page.drawImage(image, {
            x: randomX - widthInPoints / 2,
            y: randomY - heightInPoints / 2,
            width: widthInPoints,
            height: heightInPoints,
            opacity: randomOpacity / 100,
            rotate: degrees(randomRotation),
          });

          currentOperation++;
          onProgress((currentOperation / totalOperations) * 100);
        }
      } catch (err) {
        const error = err as Error;
        console.error(`Error al procesar la firma ${signature.id}:`, error);
        throw new Error(`Error al procesar la firma: ${error.message}`);
      }
    }

    return await pdfDoc.save();
  } catch (err) {
    const error = err as Error;
    console.error("Error al firmar el PDF:", error);
    throw new Error(`Error al firmar el PDF: ${error.message}`);
  }
}
