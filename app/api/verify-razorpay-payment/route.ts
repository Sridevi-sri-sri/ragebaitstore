/**
 * POST /api/verify-razorpay-payment
 *
 * 1. Receives { razorpay_order_id, razorpay_payment_id, razorpay_signature }.
 * 2. Recomputes the expected HMAC-SHA256 signature using RAZORPAY_KEY_SECRET.
 *    (Razorpay spec: HMAC of "order_id|payment_id" with key_secret)
 * 3. If signatures match  → updates Supabase order status to 'paid',
 *                           stores razorpay_payment_id, returns success.
 * 4. If signatures differ → returns 400 without touching the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse & validate request body ──────────────────────────
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      razorpay_order_id?:   string;
      razorpay_payment_id?: string;
      razorpay_signature?:  string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." },
        { status: 400 }
      );
    }

    // ── 2. Recompute expected HMAC-SHA256 signature ────────────────
    //   Razorpay spec: HMAC-SHA256( order_id + "|" + payment_id, key_secret )
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // Use timingSafeEqual to prevent timing-attack exploits
    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const receivedBuf = Buffer.from(razorpay_signature, "utf-8");

    const signaturesMatch =
      expectedBuf.length === receivedBuf.length &&
      timingSafeEqual(expectedBuf, receivedBuf);

    // ── 3. Signature mismatch → reject immediately ─────────────────
    if (!signaturesMatch) {
      return NextResponse.json(
        { error: "Payment verification failed: invalid signature." },
        { status: 400 }
      );
    }

    // ── 4. Signature valid → find the order in Supabase ───────────
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found for this Razorpay order id." },
        { status: 404 }
      );
    }

    if (order.status === "paid") {
      // Already marked paid (e.g. webhook beat us to it) — idempotent success
      return NextResponse.json({ success: true, already_paid: true });
    }

    // ── 5. Update order: status → 'paid', store payment id ────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status:              "paid",
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("[verify-razorpay-payment] Supabase update failed:", updateError);
      return NextResponse.json(
        { error: "Payment verified but failed to update order status." },
        { status: 500 }
      );
    }

    // ── 6. Return success ──────────────────────────────────────────
    return NextResponse.json({
      success:    true,
      order_id:   order.id,
      payment_id: razorpay_payment_id,
    });
  } catch (err) {
    console.error("[verify-razorpay-payment] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}