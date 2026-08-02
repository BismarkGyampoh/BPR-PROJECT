import { v4 as uuidv4 } from "uuid";

const BASE = process.env.MTN_MOMO_BASE || "https://sandbox.mtn.com";
const SUB_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "";
const API_USER = process.env.MTN_MOMO_API_USER ?? "";
const API_KEY = process.env.MTN_MOMO_API_KEY ?? "";

/**
 * When sandbox credentials are absent or still the placeholder values we run a
 * deterministic "sandbox stub": requestToPay returns an ACCEPTED reference and
 * getPaymentStatus returns SUCCESS after the first poll. This lets the full
 * checkout → track flow run end-to-end in development. Flip the env vars to
 * real MTN MoMo sandbox values (developer.mtn.com) to hit the live gateway.
 */
function isStub(): boolean {
  if (!SUB_KEY) return true;
  return SUB_KEY.startsWith("your-") || SUB_KEY.length < 10;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now() / 1000;
  if (cachedToken && now < tokenExpiresAt - 60) return cachedToken;

  const auth = Buffer.from(`${API_USER}:${API_KEY}`).toString("base64");
  const res = await fetch(`${BASE}/token?grant_type=client_credentials`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`MoMo auth failed: ${res.status}`), { status: res.status });
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in;
  return cachedToken;
}

export interface MoMoRequest {
  amount: number;
  currency: string;
  phone: string; // E.164 or local Ghana number
  externalId: string;
  payerMessage: string;
  payeeNote: string;
}

export interface MoMoRequestResult {
  referenceId: string;
  status: "PENDING" | "ACCEPTED" | "ERROR";
  simulated: boolean;
}

function normalizePartyId(phone: string): string | null {
  const digits = phone.replace(/[^\d]/g, "");
  if (!/^233\d{9}$/.test(digits)) return null;
  return digits;
}

export async function requestToPay(opts: MoMoRequest): Promise<MoMoRequestResult> {
  const partyId = normalizePartyId(opts.phone);
  if (!partyId) throw new Error("Invalid Ghana phone number for MoMo");

  if (isStub()) {
    // Simulate an accepted-to-pay request (dev/demo only).
    return { referenceId: uuidv4(), status: "ACCEPTED", simulated: true };
  }

  const token = await getAccessToken();
  const referenceId = uuidv4();
  const res = await fetch(`${BASE}/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(opts.amount),
      currency: opts.currency,
      externalId: opts.externalId,
      payer: { partyIdType: "MSISDN", partyId: partyId },
      payerMessage: opts.payerMessage,
      payeeNote: opts.payeeNote,
    }),
  });
  if (res.status === 200 || res.status === 202) {
    return { referenceId, status: "ACCEPTED", simulated: false };
  }
  return { referenceId, status: "ERROR", simulated: false };
}

export async function getPaymentStatus(referenceId: string): Promise<Record<string, unknown>> {
  if (isStub()) {
    // Stub: treat the payer as having completed payment.
    return {
      status: "SUCCESS",
      statusCode: "SUCCESSFUL",
      resultCode: "00-000",
      referenceId,
      simulated: true,
    };
  }
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1_0/requesttopay/${referenceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
    },
  });
  if (!res.ok) throw new Error(`MoMo status check failed: ${res.status}`);
  return res.json();
}
