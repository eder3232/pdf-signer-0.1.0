import { atom } from 'jotai'
import { pdfPreviewPrimitiveAtom, effectiveZoomAtom } from './pdf_preview'
import {
  signatureConfigPrimitiveAtom,
  transformStyleAtom,
} from './signature_config'
import { appliedSignaturesPrimitiveAtom } from '../signatures/applied_signatures'

// Átomo combinado para el estado completo de previsualización
export const combinedPreviewAtom = atom((get) => {
  const pdfState = get(pdfPreviewPrimitiveAtom)
  const signatureConfig = get(signatureConfigPrimitiveAtom)
  const appliedSignatures = get(appliedSignaturesPrimitiveAtom)
  const effectiveZoom = get(effectiveZoomAtom)
  const transformStyle = get(transformStyleAtom)

  return {
    pdf: {
      ...pdfState,
      effectiveZoom,
    },
    signatures: {
      ...signatureConfig,
      style: transformStyle,
      applied: appliedSignatures.signatures,
      activeId: appliedSignatures.activeSignatureId,
    },
    isReady: pdfState.isReady && appliedSignatures.signatures.length > 0,
  }
})

// Átomo derivado para determinar si se puede proceder con la firma
export const canProceedWithSigningAtom = atom((get) => {
  const preview = get(combinedPreviewAtom)
  const appliedSignatures = get(appliedSignaturesPrimitiveAtom)

  return (
    preview.isReady &&
    appliedSignatures.signatures.length > 0 &&
    appliedSignatures.signatures.every((sig) => sig.isConfigured)
  )
})

// Átomo derivado para estadísticas y resumen
export const previewStatsAtom = atom((get) => {
  const preview = get(combinedPreviewAtom)
  const appliedSignatures = preview.signatures.applied

  return {
    totalSignatures: appliedSignatures.length,
    configuredSignatures: appliedSignatures.filter((sig) => sig.isConfigured)
      .length,
    currentPage: preview.pdf.currentPage,
    totalPages: preview.pdf.totalPages,
    zoom: preview.pdf.effectiveZoom.toFixed(0) + '%',
  }
})
