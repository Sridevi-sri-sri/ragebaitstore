import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { CheckCircle, Package } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;

  // Fetch order details
  const { data: order, error } = await (supabase as any)
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Optionally fetch order_items if we want to list them here
  const { data: items } = await (supabase as any)
    .from("order_items")
    .select("*, products(name, image_url)")
    .eq("order_id", id);

  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-2xl w-full text-center">
        <CheckCircle className="mx-auto text-success mb-6" size={64} />
        <h1 className="text-4xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-lg text-muted mb-8">
          Thank you for shopping at RageBait Store. Your order has been successfully placed.
        </p>

        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 text-left mb-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <Package className="text-primary" size={24} />
            <h2 className="text-xl font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted font-medium mb-1">Shipping To</p>
              <p className="font-semibold">{order.shipping_name}</p>
              <p className="text-sm text-muted mt-1">{order.shipping_address}</p>
              <p className="text-sm text-muted">{order.shipping_city}, {order.shipping_postal_code}</p>
              <p className="text-sm text-muted">{order.shipping_phone}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted font-medium mb-1">Payment Status</p>
              <p className="font-semibold capitalize text-success">
                {order.status === "paid" ? "Paid successfully" : order.status}
              </p>
              
              <p className="text-sm text-muted font-medium mb-1 mt-4">Total Amount</p>
              <p className="font-bold text-lg text-primary">${order.total_amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}