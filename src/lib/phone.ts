import { parsePhoneNumber } from "libphonenumber-js";

/**
 * Normalise a Ghanaian phone number to E.164 for MoMo (e.g. 233240000000).
 * Accepts local (0240000000), E.164 (+233...), or whitespace-heavy input.
 * Returns null if the number is not a valid GH number.
 */
export function normalizeGhanaPhone(input: string): string | null {
  try {
    const num = parsePhoneNumber(input, "GH");
    if (!num || !num.isValid()) return null;
    return num.number; // E.164, e.g. "+233240000000"
  } catch {
    return null;
  }
}

/** MoMo MSISDN must be supplied WITHOUT the leading "+" (per MTN spec), e.g. 233240000000 */
export function moMoPartyId(input: string): string | null {
  const e164 = normalizeGhanaPhone(input);
  if (!e164) return null;
  return e164.replace("+", "");
}
