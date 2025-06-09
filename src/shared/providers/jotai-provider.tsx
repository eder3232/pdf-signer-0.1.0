'use client'

import { createStore, Provider } from 'jotai'

const myStore = createStore()

interface JotaiProviderProps {
  children: React.ReactNode
}

const JotaiProvider = ({ children }: JotaiProviderProps) => (
  <Provider store={myStore}>{children}</Provider>
)

export default JotaiProvider
