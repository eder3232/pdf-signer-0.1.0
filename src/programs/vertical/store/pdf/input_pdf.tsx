import { atom } from 'jotai'

type PdfState = {
  file: File | null // El archivo PDF como tal
  url: string | null // URL para previsualización (usando URL.createObjectURL)
  name: string // Nombre del archivo (por si lo necesitas mostrar)
  size: number // Tamaño en bytes (para validar tamaño máximo, por ejemplo)
  pageCount: number | null // Número de páginas (se puede calcular con pdf.js)
  loaded: boolean // Si el PDF ha sido cargado completamente
  error: string | null // En caso haya un error de carga/parsing
  uploadDate: Date | null // Fecha de carga (por trazabilidad)
}

const pdfStatePrimitiveAtom = atom<PdfState>({
  file: null,
  url: null,
  name: '',
  size: 0,
  pageCount: null,
  loaded: false,
  error: null,
  uploadDate: null,
})

export const pdfStateAtom = atom(
  (get) => get(pdfStatePrimitiveAtom),
  (_get, set, newPdfState: Partial<PdfState>) => {
    set(pdfStatePrimitiveAtom, (prev) => ({
      ...prev,
      ...newPdfState,
    }))
  }
)
