import { PDFDocument, degrees } from "pdf-lib";
import { AppliedSignature } from "../store/signatures/applied_signatures";

// Constantes para conversión de diferentes formatos de papel (en puntos PDF)
const PAGE_SIZES = {
  A4: { width: 595.276, height: 841.89, widthCm: 21, heightCm: 29.7 },
  A3: { width: 841.89, height: 1190.551, widthCm: 29.7, heightCm: 42 },
  LETTER: { width: 612, height: 792, widthCm: 21.59, heightCm: 27.94 },
  LEGAL: { width: 612, height: 1008, widthCm: 21.59, heightCm: 35.56 },
} as const;

// Tolerancia del 1% para variaciones en el tamaño
const SIZE_TOLERANCE_PERCENT = 0.01;

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

// Función para verificar si dos dimensiones son aproximadamente iguales
function dimensionsMatch(actual: number, expected: number): boolean {
  const tolerance = expected * SIZE_TOLERANCE_PERCENT;
  return Math.abs(actual - expected) <= tolerance;
}

// Función para identificar el formato de página
function identifyPageFormat(
  width: number,
  height: number,
): {
  format: keyof typeof PAGE_SIZES | null;
  isLandscape: boolean;
} {
  for (const [format, dims] of Object.entries(PAGE_SIZES)) {
    // Verificar orientación vertical
    const matchesVertical =
      dimensionsMatch(width, dims.width) &&
      dimensionsMatch(height, dims.height);

    // Verificar orientación horizontal
    const matchesHorizontal =
      dimensionsMatch(width, dims.height) &&
      dimensionsMatch(height, dims.width);

    if (matchesVertical) {
      return { format: format as keyof typeof PAGE_SIZES, isLandscape: false };
    }
    if (matchesHorizontal) {
      return { format: format as keyof typeof PAGE_SIZES, isLandscape: true };
    }
  }

  return { format: null, isLandscape: false };
}

function getPageProperties(pageWidth: number, pageHeight: number) {
  const { format, isLandscape } = identifyPageFormat(pageWidth, pageHeight);

  if (!format) {
    const dimensions = `${pageWidth.toFixed(3)}x${pageHeight.toFixed(3)}`;
    const allowedFormats = Object.entries(PAGE_SIZES)
      .map(
        ([name, dims]) =>
          `${name}: ${dims.width.toFixed(3)}x${dims.height.toFixed(3)}`,
      )
      .join(", ");

    throw new Error(
      `Formato de página no soportado: ${dimensions} puntos. ` +
        `Se permite una variación de ±${(SIZE_TOLERANCE_PERCENT * 100).toFixed(1)}% ` +
        `sobre los siguientes formatos: ${allowedFormats}`,
    );
  }

  const formatDims = PAGE_SIZES[format];

  // Usar las dimensiones exactas del formato estándar para los cálculos
  const standardWidth = isLandscape ? formatDims.height : formatDims.width;
  const standardWidthCm = isLandscape
    ? formatDims.heightCm
    : formatDims.widthCm;

  return {
    isLandscape,
    format,
    pointsPerCm: standardWidth / standardWidthCm,
    // Añadimos las dimensiones estándar para referencia
    standardDimensions: {
      width: isLandscape ? formatDims.height : formatDims.width,
      height: isLandscape ? formatDims.width : formatDims.height,
    },
  };
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

    // Validar todas las páginas antes de comenzar
    const invalidPages = pages
      .map((page, index) => {
        const { width, height } = page.getSize();
        return identifyPageFormat(width, height).format ? -1 : index + 1;
      })
      .filter((pageNum) => pageNum !== -1);

    if (invalidPages.length > 0) {
      throw new Error(
        `El documento contiene páginas con formatos no soportados. ` +
          `Páginas: ${invalidPages.join(", ")}. ` +
          `Se permite una variación de ±${(SIZE_TOLERANCE_PERCENT * 100).toFixed(1)}% ` +
          `sobre los formatos estándar: ${Object.keys(PAGE_SIZES).join(", ")}`,
      );
    }

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
          const { isLandscape, pointsPerCm } = getPageProperties(
            pageWidth,
            pageHeight,
          );

          // Ajustar coordenadas según orientación
          const effectiveWidth = isLandscape ? pageHeight : pageWidth;
          const effectiveHeight = isLandscape ? pageWidth : pageHeight;

          // Calcular posición con variación aleatoria
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

          // Calcular dimensiones manteniendo proporción cm/puntos según el tamaño real
          const widthInCm = getRandomValue(
            signature.config.width,
            randomness.widthVariance,
            0.5,
            Math.min(15, effectiveWidth / pointsPerCm), // Limitar según ancho de página
          );

          const widthInPoints = widthInCm * pointsPerCm;
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

          // Aplicar transformación según orientación si es necesario
          const finalRotation = isLandscape
            ? randomRotation + 90
            : randomRotation;

          page.drawImage(image, {
            x: randomX - widthInPoints / 2,
            y: randomY - heightInPoints / 2,
            width: widthInPoints,
            height: heightInPoints,
            opacity: randomOpacity / 100,
            rotate: degrees(finalRotation),
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
