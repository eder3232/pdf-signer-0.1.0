import { atom } from 'jotai'
import { produce } from 'immer'

// Tipos
export type ViewMode = 'fit-width' | 'fit-page' | 'custom'

export interface PDFPreviewDimensions {
  width: number | null
  height: number | null
  naturalWidth: number | null
  naturalHeight: number | null
}

export interface PDFPreviewState {
  currentPage: number
  totalPages: number
  zoom: number
  dimensions: PDFPreviewDimensions
  viewMode: ViewMode
  isReady: boolean
}

// Estado inicial
const defaultPreviewState: PDFPreviewState = {
  currentPage: 1,
  totalPages: 1,
  zoom: 100,
  dimensions: {
    width: null,
    height: null,
    naturalWidth: null,
    naturalHeight: null,
  },
  viewMode: 'fit-width',
  isReady: false,
}

// Átomo primitivo
export const pdfPreviewPrimitiveAtom =
  atom<PDFPreviewState>(defaultPreviewState)

// Átomos de acción individuales
export const setCurrentPageAtom = atom(null, (get, set, page: number) => {
  const state = get(pdfPreviewPrimitiveAtom)
  if (page < 1 || page > state.totalPages) return

  set(
    pdfPreviewPrimitiveAtom,
    produce(state, (draft) => {
      draft.currentPage = page
    })
  )
})

export const setZoomAtom = atom(null, (get, set, zoom: number) => {
  const state = get(pdfPreviewPrimitiveAtom)

  set(
    pdfPreviewPrimitiveAtom,
    produce(state, (draft) => {
      draft.zoom = zoom
      draft.viewMode = 'custom'
    })
  )
})

export const setViewModeAtom = atom(null, (get, set, mode: ViewMode) => {
  const state = get(pdfPreviewPrimitiveAtom)

  set(
    pdfPreviewPrimitiveAtom,
    produce(state, (draft) => {
      draft.viewMode = mode
      // Si cambiamos a un modo automático, reseteamos el zoom
      if (mode !== 'custom') {
        draft.zoom = 100
      }
    })
  )
})

export const setDimensionsAtom = atom(
  null,
  (get, set, dimensions: PDFPreviewDimensions) => {
    const state = get(pdfPreviewPrimitiveAtom)

    set(
      pdfPreviewPrimitiveAtom,
      produce(state, (draft) => {
        draft.dimensions = dimensions
      })
    )
  }
)

export const setTotalPagesAtom = atom(null, (get, set, total: number) => {
  const state = get(pdfPreviewPrimitiveAtom)

  set(
    pdfPreviewPrimitiveAtom,
    produce(state, (draft) => {
      draft.totalPages = total
      draft.isReady = true
    })
  )
})

export const resetPreviewAtom = atom(null, (_get, set) => {
  set(pdfPreviewPrimitiveAtom, defaultPreviewState)
})

// Átomos derivados para cálculos y estados computados
export const effectiveZoomAtom = atom((get) => {
  const state = get(pdfPreviewPrimitiveAtom)
  const { viewMode, zoom, dimensions } = state

  if (!dimensions.width || !dimensions.naturalWidth) return zoom

  switch (viewMode) {
    case 'fit-width':
      return (dimensions.width / dimensions.naturalWidth) * 100
    case 'fit-page':
      const widthRatio = dimensions.width / dimensions.naturalWidth
      const heightRatio = dimensions.height! / dimensions.naturalHeight!
      return Math.min(widthRatio, heightRatio) * 100
    default:
      return zoom
  }
})

export const isZoomableAtom = atom((get) => {
  const state = get(pdfPreviewPrimitiveAtom)
  return state.isReady && state.dimensions.naturalWidth !== null
})

export const canNavigateAtom = atom((get) => {
  const state = get(pdfPreviewPrimitiveAtom)
  return {
    prev: state.currentPage > 1,
    next: state.currentPage < state.totalPages,
  }
})
