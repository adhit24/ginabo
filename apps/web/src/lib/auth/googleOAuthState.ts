export const GOOGLE_OAUTH_STATE_COOKIE = "g_oauth_state";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time comparison over fixed-length SHA-256 hex digests, so neither
// the state value's length nor its content is revealed via timing.
export async function stateMatches(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  let diff = 0;
  for (let i = 0; i < hashA.length; i++) {
    diff |= hashA.charCodeAt(i) ^ hashB.charCodeAt(i);
  }
  return diff === 0;
}
