/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL: string;
  readonly VITE_LIVESCORE_ADMIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
