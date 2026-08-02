import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const { data, error } = await (supabase as any)
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Failed to fetch order status:", error);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ status: data.status }, { status: 200 });
  } catch (error) {
    console.error("Order status API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}