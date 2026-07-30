/**
 * POST /api/create-razorpay-order
 *
 * 1. Accepts { order_id } — our Supabase order UUID.
 * 2. Fetches the order's total_amount from Supabase.
 * 3. Creates a Razorpay Order for that amount in paise (total_amount × 100).
 * 4. Saves the Razorpay order id back to the Supabase row.
 * 5. Returns { razorpay_order_id, amount, currency, key_id } to the frontend.
 */

import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse request body ──────────────────────────────────────
    const body = await request.json();
    const { order_id } = body as { order_id?: string };

    if (!order_id || typeof order_id !== "string") {
      return NextResponse.json(
        { error: "order_id is required and must be a string." },
        { status: 400 }
      );
    }

    // ── 2. Fetch the order's total_amount from Supabase ───────────
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, total_amount, status")
      .eq("id", order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Order is already ${order.status}. Cannot create a new payment.` },
        { status: 409 }
      );
    }

    // ── 3. Create a Razorpay Order (amount in paise) ──────────────
    const amountInPaise = Math.round(order.total_amount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: "INR",
      receipt:  order_id,          // our Supabase id as the receipt reference
    });

    // ── 4. Save Razorpay order id back to Supabase ────────────────
    const { error: updateError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", order_id);

    if (updateError) {
      console.error("[create-razorpay-order] Supabase update failed:", updateError);
      return NextResponse.json(
        { error: "Failed to save Razorpay order id to database." },
        { status: 500 }
      );
    }

    // ── 5. Return data to the frontend ────────────────────────────
    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount:            rzpOrder.amount,      // in paise
      currency:          rzpOrder.currency,
      key_id:            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // safe to send
    });
  } catch (err) {
    console.error("[create-razorpay-order] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}