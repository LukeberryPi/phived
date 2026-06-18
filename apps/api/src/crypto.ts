// AES-256-GCM encryption-at-rest for the task document (ADR 0004). A single
// server-held master key (TASKS_ENC_KEY, 32 bytes base64) protects every
// document; key_version is stored alongside each row so the key can be rotated
// without a flag-day re-encryption. This is at-rest protection, not E2E: the
// running server holds the key and sees plaintext.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const CURRENT_KEY_VERSION = 1;

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

export interface EncryptedBlob {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyVersion: number;
}

function loadKey(keyVersion: number): Buffer {
  if (keyVersion !== CURRENT_KEY_VERSION) {
    throw new Error(`no key registered for key_version ${keyVersion}`);
  }

  // Read at call time (not module load) so the key can be provided after import.
  const raw = process.env.TASKS_ENC_KEY;
  if (!raw) {
    throw new Error("TASKS_ENC_KEY is not set");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `TASKS_ENC_KEY must decode to ${KEY_BYTES} bytes, got ${key.length}`
    );
  }
  return key;
}

export function encrypt(plaintext: string): EncryptedBlob {
  const key = loadKey(CURRENT_KEY_VERSION);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag, keyVersion: CURRENT_KEY_VERSION };
}

export function decrypt(blob: EncryptedBlob): string {
  const key = loadKey(blob.keyVersion);
  const decipher = createDecipheriv(ALGORITHM, key, blob.iv);
  decipher.setAuthTag(blob.authTag);
  return Buffer.concat([
    decipher.update(blob.ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
