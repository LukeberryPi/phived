import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { TaskSnapshot } from "./types";

const KEY_VERSION = 1;

export type EncryptedTaskSnapshot = {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyVersion: number;
};

export function parseEncryptionKey(raw: string) {
  const base64 = Buffer.from(raw, "base64");
  if (base64.length === 32) {
    return base64;
  }

  const hex = Buffer.from(raw, "hex");
  if (hex.length === 32) {
    return hex;
  }

  throw new Error("TASKS_ENC_KEY must be a 32-byte base64 or hex value");
}

export function encryptTaskSnapshot(
  snapshot: TaskSnapshot,
  key: Buffer
): EncryptedTaskSnapshot {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(snapshot), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    ciphertext,
    iv,
    authTag: cipher.getAuthTag(),
    keyVersion: KEY_VERSION,
  };
}

export function decryptTaskSnapshot(
  encrypted: EncryptedTaskSnapshot,
  key: Buffer
): TaskSnapshot {
  if (encrypted.keyVersion !== KEY_VERSION) {
    throw new Error(`unsupported task key version ${encrypted.keyVersion}`);
  }

  const decipher = createDecipheriv("aes-256-gcm", key, encrypted.iv);
  decipher.setAuthTag(encrypted.authTag);
  const plaintext = Buffer.concat([
    decipher.update(encrypted.ciphertext),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString("utf8")) as TaskSnapshot;
}
