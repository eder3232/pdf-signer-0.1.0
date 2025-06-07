import { atom } from 'jotai'

type PdfState = File | null

const pdfPrimitiveAtom = atom<File | null>(null)

export const pdfAtom = atom(
  (get) => get(pdfPrimitiveAtom),
  (_get, set, newFile: File) => {
    set(pdfPrimitiveAtom, newFile)
  }
)

type HojaActual = 'first' | 'last'

const selectedPagePrimitiveAtom = atom<HojaActual>('first')

export const selectedPageAtom = atom(
  (get) => get(selectedPagePrimitiveAtom),
  (_get, set, newHoja: HojaActual) => {
    set(selectedPagePrimitiveAtom, newHoja)
  }
)
