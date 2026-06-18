// Ambient types for the JS site contract so TypeScript consumers (apps/api)
// can import it without `any`. The runtime source of truth stays in
// site-contract.mjs; keep these in sync.
export const paths: {
  root: string;
  dist: string;
  webDist: string;
  appDist: string;
};

export const appBasePath: string;
export const appMountDir: string;
export const appHref: string;

export const ports: { server: number };
export const host: string;

export const serviceWorker: {
  path: string;
  cacheControl: string;
};

export const securityHeaders: Record<string, string>;

export const requiredOutputs: string[];

export function isAppPath(pathname?: string): boolean;
