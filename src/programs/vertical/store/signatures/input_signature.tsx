import { atom } from 'jotai'
import { produce } from 'immer'
import { v4 as uuidv4 } from 'uuid'

// Constantes para recomendaciones
export const SIGNATURE_RECOMMENDATIONS = {
  MIN_WIDTH: 300, // px
  MIN_HEIGHT: 100, // px
  PREFERRED_FORMAT: 'image/png',
  MAX_SIZE_MB: 2,
} as const

export type SignatureState = {
  id: string | null
  name: string
  data: string | null // base64 de la imagen
  fileType: 'image/png' | 'image/jpeg' | null
  size: number // en bytes
  metadata: {
    width: number | null
    height: number | null
    aspectRatio: number | null
  }
  warnings: {
    smallDimensions: boolean // true si las dimensiones son menores a las recomendadas
    notPNG: boolean // true si no es PNG
  }
  createdAt: Date | null
}

const defaultSignatureState: SignatureState = {
  id: null,
  name: '',
  data: null,
  fileType: null,
  size: 0,
  metadata: {
    width: null,
    height: null,
    aspectRatio: null,
  },
  warnings: {
    smallDimensions: false,
    notPNG: false,
  },
  createdAt: null,
}

const signatureStatePrimitiveAtom = atom<SignatureState>(defaultSignatureState)

// Función auxiliar para validar dimensiones y generar warnings
const generateWarnings = (
  width: number | null,
  height: number | null,
  fileType: string | null
) => {
  return {
    smallDimensions:
      !!width &&
      !!height &&
      (width < SIGNATURE_RECOMMENDATIONS.MIN_WIDTH ||
        height < SIGNATURE_RECOMMENDATIONS.MIN_HEIGHT),
    notPNG: fileType !== SIGNATURE_RECOMMENDATIONS.PREFERRED_FORMAT,
  }
}

// Átomo con getter y setter personalizado
export const signatureStateAtom = atom(
  (get) => get(signatureStatePrimitiveAtom),
  (_get, set, newSignatureState: Partial<SignatureState>) => {
    set(
      signatureStatePrimitiveAtom,
      produce((draft) => {
        // Si es un nuevo registro, generamos un ID
        if (!draft.id) {
          draft.id = uuidv4()
        }

        // Actualizamos las propiedades básicas
        Object.assign(draft, newSignatureState)

        // Actualizamos metadata y calculamos aspect ratio si hay nuevas dimensiones
        if (newSignatureState.metadata) {
          Object.assign(draft.metadata, newSignatureState.metadata)

          const width = newSignatureState.metadata.width
          const height = newSignatureState.metadata.height

          if (
            width !== undefined &&
            width !== null &&
            height !== undefined &&
            height !== null
          ) {
            draft.metadata.aspectRatio = width / height
          }
        }

        // Actualizamos warnings si hay cambios en dimensiones o tipo de archivo
        if (
          newSignatureState.metadata?.width !== undefined &&
          newSignatureState.metadata?.height !== undefined
        ) {
          draft.warnings = generateWarnings(
            newSignatureState.metadata.width,
            newSignatureState.metadata.height,
            newSignatureState.fileType || draft.fileType
          )
          console.log('warnings', draft.warnings)
        }

        // Establecemos createdAt si no existe
        if (!draft.createdAt) {
          draft.createdAt = new Date()
        }
      })
    )
  }
)
