import { securityHeaders } from "../../../scripts/site-contract.mjs";

export function applySecurityHeaders(headers: Headers): void {
  for (const [name, value] of Object.entries(securityHeaders)) {
    headers.set(name, value);
  }
}
