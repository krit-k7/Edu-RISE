// Generates (once) and persists a random 32-byte secret used only to
// derive this browser's nullifier in `verify_eligibility` (see
// contracts/scholarship.compact). This value is never disclosed on-chain
// and never sent anywhere — only its persistentCommit hash is, as part of
// the ZK proof. Losing/clearing it (e.g. a fresh browser profile) means a
// new nullifier will be derived, which is a known limitation documented
// alongside the contract change — see that file for why full Sybil
// resistance needs issuer credentials (review item 8), not just a device
// secret.
const STORAGE_KEY = 'edurise:applicant-secret:v1';

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function getOrCreateApplicantSecret(): Uint8Array {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return fromHex(existing);

  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  localStorage.setItem(STORAGE_KEY, toHex(secret));
  return secret;
}
