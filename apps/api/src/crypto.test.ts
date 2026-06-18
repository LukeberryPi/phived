// Verifies AES-256-GCM round-trips and that tampering is detected. Sets a test
// key in the environment before importing the module under test.
import { beforeAll, describe, expect, test } from "bun:test";
import { randomBytes } from "node:crypto";

beforeAll(() => {
  process.env.TASKS_ENC_KEY = randomBytes(32).toString("base64");
});

describe("crypto", () => {
  test("encrypt then decrypt returns the original plaintext", async () => {
    const { encrypt, decrypt } = await import("./crypto.ts");
    const plaintext = JSON.stringify({ canvasLists: [1, 2], taskHistory: [] });
    const blob = encrypt(plaintext);
    expect(blob.keyVersion).toBe(1);
    expect(decrypt(blob)).toBe(plaintext);
  });

  test("a tampered auth tag fails decryption", async () => {
    const { encrypt, decrypt } = await import("./crypto.ts");
    const blob = encrypt("secret");
    blob.authTag = randomBytes(blob.authTag.length);
    expect(() => decrypt(blob)).toThrow();
  });
});
