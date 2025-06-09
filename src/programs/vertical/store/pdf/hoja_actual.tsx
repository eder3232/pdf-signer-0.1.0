import { atom } from 'jotai'

type HojaActual = 'first' | 'last'

const selectedPagePrimitiveAtom = atom<HojaActual>('first')

export const selectedPageAtom = atom(
  (get) => get(selectedPagePrimitiveAtom),
  (_get, set, newHoja: HojaActual) => {
    set(selectedPagePrimitiveAtom, newHoja)
  }
)
