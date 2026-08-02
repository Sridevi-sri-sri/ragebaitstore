import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cartItems, shipping, totalAmount } = body;

    if (!userId || !cartItems || cartItems.length === 0 || !shipping || totalAmount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1) Insert order
    const { data: orderData, error: orderError } = await (supabase as any)
      .from("orders")
      .insert([{
        user_id: userId,
        status: "pending",
        total_amount: totalAmount,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_postal_code: shipping.postalCode,
        shipping_phone: shipping.phone,
      }])
      .select("id")
      .single();

    if (orderError || !orderData) {
      console.error("Order insertion error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderId = orderData.id;

    // 2) Insert order items
    const orderItemsToInsert = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0, // Fallback if price wasn't joined
    }));

    const { error: itemsError } = await (supabase as any)
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Order items insertion error:", itemsError);
      // We might have an orphaned order, but proceeding to return error
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // 3) Clear the user's cart
    const { error: clearCartError } = await (supabase as any)
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (clearCartError) {
      console.error("Failed to clear cart:", clearCartError);
      // Non-fatal, order was created
    }

    // 4) Return order ID
    return NextResponse.json({ orderId }, { status: 200 });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ ok: true }); }