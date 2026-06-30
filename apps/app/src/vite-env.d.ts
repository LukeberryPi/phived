/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Flag-gates the additive sync/account UI. Off unless set to "true". */
  readonly VITE_SYNC_UI?: string;
  /** Optional auth API origin for dev; same-origin in production. */
  readonly VITE_AUTH_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
