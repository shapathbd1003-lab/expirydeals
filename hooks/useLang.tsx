'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type Lang = 'en' | 'bn'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangCtx = createContext<LangContextType>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
