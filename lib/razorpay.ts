/**
 * lib/razorpay.ts
 *
 * Server-only Razorpay client singleton.
 *
 * IMPORTANT: This file must NEVER be imported in Client Components or any
 * code that runs in the browser. RAZORPAY_KEY_SECRET is a server-only secret.
 * Next.js will throw a build error if a server-only module is accidentally
 * imported client-side, but adding "server-only" here makes it explicit.
 */

import Razorpay from "razorpay";

const keyId     = process.env.RAZORPAY_KEY_ID!;
const keySecret = process.env.RAZORPAY_KEY_SECRET!;

if (!keyId || !keySecret) {
  throw new Error(
    "Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
  );
}

/**
 * Singleton Razorpay instance.
 * Initialised once at module load time — safe for Next.js API routes.
 */
export const razorpay = new Razorpay({
  key_id:     keyId,
  key_secret: keySecret,
});