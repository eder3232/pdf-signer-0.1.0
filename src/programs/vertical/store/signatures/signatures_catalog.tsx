import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { produce } from 'immer'
import { SignatureState } from './input_signature'

export interface CatalogSignature extends Omit<SignatureState, 'id'> {
  id: string // nunca será null en el catálogo
  alias: string
  dateAdded: string
}

interface SignaturesCatalog {
  signatures: CatalogSignature[]
  searchTerm: string
}

const initialCatalogState: SignaturesCatalog = {
  signatures: [],
  searchTerm: '',
}

// Átomo principal con persistencia en localStorage
export const signaturesCatalogPrimitiveAtom =
  atomWithStorage<SignaturesCatalog>('signatures-catalog', initialCatalogState)

// Átomo derivado para firmas filtradas
export const filteredSignaturesAtom = atom((get) => {
  const catalog = get(signaturesCatalogPrimitiveAtom)
  const searchTerm = catalog.searchTerm.trim().toLowerCase()

  if (!searchTerm) return catalog.signatures

  return catalog.signatures.filter(
    (sig) =>
      sig.name.toLowerCase().includes(searchTerm) ||
      sig.alias.toLowerCase().includes(searchTerm)
  )
})

// Átomo para acciones del catálogo
export const signaturesCatalogActionsAtom = atom(
  null,
  (
    get,
    set,
    action: {
      type: 'ADD' | 'REMOVE' | 'UPDATE' | 'SET_SEARCH'
      payload: any
    }
  ) => {
    const catalog = get(signaturesCatalogPrimitiveAtom)

    switch (action.type) {
      case 'ADD': {
        const newSignature = action.payload as CatalogSignature
        set(
          signaturesCatalogPrimitiveAtom,
          produce(catalog, (draft) => {
            draft.signatures.push(newSignature)
          })
        )
        break
      }
      case 'REMOVE': {
        const idToRemove = action.payload as string
        set(
          signaturesCatalogPrimitiveAtom,
          produce(catalog, (draft) => {
            draft.signatures = draft.signatures.filter(
              (sig) => sig.id !== idToRemove
            )
          })
        )
        break
      }
      case 'UPDATE': {
        const updatedSignature = action.payload as CatalogSignature
        set(
          signaturesCatalogPrimitiveAtom,
          produce(catalog, (draft) => {
            const index = draft.signatures.findIndex(
              (sig) => sig.id === updatedSignature.id
            )
            if (index !== -1) {
              draft.signatures[index] = updatedSignature
            }
          })
        )
        break
      }
      case 'SET_SEARCH': {
        const searchTerm = action.payload as string
        set(
          signaturesCatalogPrimitiveAtom,
          produce(catalog, (draft) => {
            draft.searchTerm = searchTerm
          })
        )
        break
      }
    }
  }
)
