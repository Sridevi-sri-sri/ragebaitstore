import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;       // in INR (paise-free, e.g. 499.00)
  image_url: string;
  category: string;
  slug: string;
}

// ─────────────────────────────────────────────────────────────
//  Data-fetching layer — Supabase
//  To swap back to in-memory data, replace the body of this
//  function only. The GET handler below stays the same.
// ─────────────────────────────────────────────────────────────

async function fetchProducts(search: string, category: string): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("id, name, description, price, image_url, category, slug");

  // Push filtering to the database for efficiency
  if (search) {
    // ilike: case-insensitive LIKE — matches anywhere in the name
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Product[];
}

// ─────────────────────────────────────────────────────────────
//  GET /api/products
//  Query params:
//    ?search=<string>   — case-insensitive match on name (ilike)
//    ?category=<string> — exact match on category (eq)
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const category = searchParams.get("category")?.trim().toLowerCase() ?? "";

    const products = await fetchProducts(search, category);

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}