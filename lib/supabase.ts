/**
 * lib/supabase.ts
 *
 * Exports a single Supabase client instance for use throughout the app.
 *
 * Rules:
 *  - Uses the PUBLIC anon key only — never the service-role key.
 *  - Config is read from NEXT_PUBLIC_* env vars — no hardcoded values.
 *  - Safe to import in both Server Components and Client Components.
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 *   const { data, error } = await supabase.from("products").select("*");
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
//  Database type definitions (mirrors the SQL schema)
// ─────────────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  slug: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_phone: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// Insert types — all server-generated fields are optional
export type ProductInsert    = Omit<Product,   "id" | "created_at"> & Partial<Pick<Product,   "id" | "created_at">>;
export type CartItemInsert   = Omit<CartItem,  "id" | "created_at"> & Partial<Pick<CartItem,  "id" | "created_at">>;
export type OrderInsert      = Omit<Order,     "id" | "created_at"> & Partial<Pick<Order,     "id" | "created_at">>;
export type OrderItemInsert  = Omit<OrderItem, "id">                & Partial<Pick<OrderItem, "id">>;

// Update types — all fields optional
export type ProductUpdate    = Partial<Product>;
export type CartItemUpdate   = Partial<CartItem>;
export type OrderUpdate      = Partial<Order>;
export type OrderItemUpdate  = Partial<OrderItem>;

export type Database = {
  public: {
    Tables: {
      products: {
        Row:    Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      cart_items: {
        Row:    CartItem;
        Insert: CartItemInsert;
        Update: CartItemUpdate;
      };
      orders: {
        Row:    Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row:    OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
      };
    };
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  Client singleton
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnon
);