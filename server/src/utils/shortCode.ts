/**
 * encodeIdToShortCode
 *
 * Converts a positive integer into a base-26 lowercase alphabetic string.
 *
 * Mapping:
 *   1  -> a
 *   2  -> b
 *   …
 *   26 -> z
 *   27 -> aa
 *   28 -> ab
 *
 * This is a deterministic, collision-free encoding — no randomness involved.
 */

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const BASE = ALPHABET.length; // 26

export function encodeIdToShortCode(id: number): string {
  if (id <= 0) {
    throw new Error("ID must be a positive integer");
  }

  let remainder: number;
  let result = "";

  // Convert to base-26 using 1-based digits (a=1 … z=26)
  while (id > 0) {
    remainder = id % BASE;

    // When remainder is 0 the digit is 'z' (value 26), so we subtract BASE
    if (remainder === 0) {
      result = ALPHABET[BASE - 1] + result; // 'z'
      id = Math.floor(id / BASE) - 1;
    } else {
      result = ALPHABET[remainder - 1] + result;
      id = Math.floor(id / BASE);
    }
  }

  return result;
}
