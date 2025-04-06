/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AW_API_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}