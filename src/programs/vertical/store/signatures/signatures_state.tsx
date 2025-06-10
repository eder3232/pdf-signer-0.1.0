import { atom } from 'jotai'
import { signatureStateAtom } from './input_signature'
import {
  signaturesCatalogPrimitiveAtom,
  signaturesCatalogActionsAtom,
  CatalogSignature,
} from './signatures_catalog'
import {
  appliedSignaturesPrimitiveAtom,
  appliedSignaturesActionsAtom,
  allSignaturesConfiguredAtom,
} from './applied_signatures'

// Re-exportamos el átomo de estado de firma
export { signatureStateAtom } from './input_signature'

// Átomo derivado para validar si una firma puede ser aplicada al documento
export const canApplySignatureAtom = atom((get) => {
  const currentSignature = get(signatureStateAtom)
  const appliedSignatures = get(appliedSignaturesPrimitiveAtom).signatures

  if (!currentSignature?.id) return false

  return !appliedSignatures.some((sig) => sig.id === currentSignature.id)
})

// Átomo derivado para validar si una firma ya existe en el catálogo
export const isSignatureInCatalogAtom = atom((get) => {
  const currentSignature = get(signatureStateAtom)
  const catalog = get(signaturesCatalogPrimitiveAtom)

  if (!currentSignature?.id) return false

  return catalog.signatures.some((sig) => sig.id === currentSignature.id)
})

// Átomo para guardar una firma en el catálogo
export const saveToCatalogAtom = atom(null, (get, set) => {
  const currentSignature = get(signatureStateAtom)
  const isInCatalog = get(isSignatureInCatalogAtom)

  if (!currentSignature?.id || isInCatalog) return

  const catalogSignature: CatalogSignature = {
    ...currentSignature,
    id: currentSignature.id,
    alias: currentSignature.name,
    dateAdded: new Date().toISOString().split('T')[0],
  }

  set(signaturesCatalogActionsAtom, {
    type: 'ADD',
    payload: catalogSignature,
  })
})

// Átomo para aplicar una firma al documento
export const applySignatureAtom = atom(null, (get, set) => {
  const currentSignature = get(signatureStateAtom)
  const catalog = get(signaturesCatalogPrimitiveAtom)

  if (!currentSignature?.id) return

  const existingSignature = catalog.signatures.find(
    (sig) => sig.id === currentSignature.id
  )

  set(appliedSignaturesActionsAtom, {
    type: 'ADD',
    payload: existingSignature || {
      ...currentSignature,
      id: currentSignature.id,
      alias: currentSignature.name,
      dateAdded: new Date().toISOString().split('T')[0],
    },
  })
})

// Átomo derivado para el estado general del proceso
export const signaturesProcessStateAtom = atom((get) => {
  const catalog = get(signaturesCatalogPrimitiveAtom)
  const appliedSignatures = get(appliedSignaturesPrimitiveAtom).signatures
  const allConfigured = get(allSignaturesConfiguredAtom)

  return {
    hasSignatures: catalog.signatures.length > 0,
    appliedCount: appliedSignatures.length,
    allConfigured,
    canProceed: appliedSignatures.length > 0 && allConfigured,
  }
})

// Átomo para limpiar todas las firmas aplicadas
export const clearAllAppliedSignaturesAtom = atom(null, (_get, set) => {
  set(appliedSignaturesActionsAtom, {
    type: 'CLEAR_ALL',
    payload: null,
  })
})
