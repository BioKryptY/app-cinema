/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOME_APLICACAO: string
  readonly VITE_API_URL: string
  readonly VITE_API_PORTA: string
  readonly VITE_PORTA_DEV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
