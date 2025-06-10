import { atom } from 'jotai'
import { produce } from 'immer'

// Tipos
export interface SignatureTransform {
  x: number // porcentaje del ancho del PDF
  y: number // porcentaje del alto del PDF
  scale: number // porcentaje del tamaño original
  rotation: number // grados
  opacity: number // porcentaje
}

export interface SignatureConfigState {
  transform: SignatureTransform
  isDragging: boolean
  isResizing: boolean
  isRotating: boolean
}

// Estado inicial
const defaultTransform: SignatureTransform = {
  x: 50,
  y: 50,
  scale: 100,
  rotation: 0,
  opacity: 100,
}

const defaultConfigState: SignatureConfigState = {
  transform: defaultTransform,
  isDragging: false,
  isResizing: false,
  isRotating: false,
}

// Átomo primitivo
export const signatureConfigPrimitiveAtom =
  atom<SignatureConfigState>(defaultConfigState)

// Átomos de acción para transformación
export const updateTransformAtom = atom(
  null,
  (get, set, transform: Partial<SignatureTransform>) => {
    const state = get(signatureConfigPrimitiveAtom)

    set(
      signatureConfigPrimitiveAtom,
      produce(state, (draft) => {
        Object.assign(draft.transform, transform)
      })
    )
  }
)

export const resetTransformAtom = atom(null, (get, set) => {
  const state = get(signatureConfigPrimitiveAtom)

  set(
    signatureConfigPrimitiveAtom,
    produce(state, (draft) => {
      draft.transform = defaultTransform
    })
  )
})

// Átomos de acción para estados de edición
export const setDraggingAtom = atom(null, (get, set, isDragging: boolean) => {
  const state = get(signatureConfigPrimitiveAtom)

  set(
    signatureConfigPrimitiveAtom,
    produce(state, (draft) => {
      draft.isDragging = isDragging
    })
  )
})

export const setResizingAtom = atom(null, (get, set, isResizing: boolean) => {
  const state = get(signatureConfigPrimitiveAtom)

  set(
    signatureConfigPrimitiveAtom,
    produce(state, (draft) => {
      draft.isResizing = isResizing
    })
  )
})

export const setRotatingAtom = atom(null, (get, set, isRotating: boolean) => {
  const state = get(signatureConfigPrimitiveAtom)

  set(
    signatureConfigPrimitiveAtom,
    produce(state, (draft) => {
      draft.isRotating = isRotating
    })
  )
})

// Átomos derivados
export const isEditingAtom = atom((get) => {
  const state = get(signatureConfigPrimitiveAtom)
  return state.isDragging || state.isResizing || state.isRotating
})

export const transformStyleAtom = atom((get) => {
  const state = get(signatureConfigPrimitiveAtom)
  const { x, y, scale, rotation, opacity } = state.transform

  return {
    transform: `translate(${x}%, ${y}%) scale(${
      scale / 100
    }) rotate(${rotation}deg)`,
    opacity: opacity / 100,
  }
})
