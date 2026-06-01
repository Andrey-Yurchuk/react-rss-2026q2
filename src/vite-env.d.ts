/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUERY_CACHE_TTL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
