import { NextRequest, NextResponse } from "next/server";

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
//  In-memory seed data
//  ⚠️  SWAP POINT — replace this array with a Supabase fetch
//     inside `fetchAllProducts()` below when ready.
// ─────────────────────────────────────────────────────────────

const PRODUCTS_SEED: Product[] = [
  {
    id: "prod_001",
    name: "Chaos Theory Tee",
    description:
      "Wear your disorder proudly. Ultra-soft 100% cotton with a chaotic graphic print designed to start conversations.",
    price: 649,
    image_url: "https://placehold.co/600x600/e63946/ffffff?text=Chaos+Tee",
    category: "tees",
    slug: "chaos-theory-tee",
  },
  {
    id: "prod_002",
    name: "Rage Bait Hoodie",
    description:
      "The hoodie that provokes. Heavyweight fleece, kangaroo pocket, and embroidered logo that says everything without saying anything.",
    price: 1499,
    image_url: "https://placehold.co/600x600/1d3557/f1faee?text=Rage+Hoodie",
    category: "hoodies",
    slug: "rage-bait-hoodie",
  },
  {
    id: "prod_003",
    name: "Main Character Cap",
    description:
      "Structured 6-panel cap with embroidered text. Adjustable strap. Because every story needs a protagonist.",
    price: 499,
    image_url: "https://placehold.co/600x600/f4a261/ffffff?text=Main+Cap",
    category: "accessories",
    slug: "main-character-cap",
  },
  {
    id: "prod_004",
    name: "Unfiltered Graphic Tee",
    description:
      "Bold, raw, unapologetic. Screen-printed heavyweight tee with a design that refuses to be ignored.",
    price: 749,
    image_url: "https://placehold.co/600x600/e63946/ffffff?text=Unfiltered+Tee",
    category: "tees",
    slug: "unfiltered-graphic-tee",
  },
  {
    id: "prod_005",
    name: "Loud Mouth Zip Hoodie",
    description:
      "Full-zip fleece hoodie with contrast lining. Say what everyone's thinking without opening your mouth.",
    price: 1799,
    image_url: "https://placehold.co/600x600/1d3557/f4a261?text=Loud+Hoodie",
    category: "hoodies",
    slug: "loud-mouth-zip-hoodie",
  },
  {
    id: "prod_006",
    name: "Provocateur Tote",
    description:
      "Heavy-duty canvas tote with a slogan that makes people look twice. Fits a laptop. Starts arguments.",
    price: 399,
    image_url: "https://placehold.co/600x600/0d1117/e63946?text=Tote+Bag",
    category: "accessories",
    slug: "provocateur-tote",
  },
  {
    id: "prod_007",
    name: "Hypebeast Killer Tee",
    description:
      "Anti-hype statement tee. Vintage wash, relaxed fit, oversized print. The most ironic shirt in any room.",
    price: 699,
    image_url: "https://placehold.co/600x600/e63946/ffffff?text=Hypebeast+Tee",
    category: "tees",
    slug: "hypebeast-killer-tee",
  },
  {
    id: "prod_008",
    name: "Dissent Enamel Pin Set",
    description:
      "Set of 3 hard-enamel pins. Pin them on your bag, jacket, or wherever you need a little extra attitude.",
    price: 299,
    image_url: "https://placehold.co/600x600/f4a261/0d1117?text=Pin+Set",
    category: "accessories",
    slug: "dissent-enamel-pin-set",
  },
];

// ─────────────────────────────────────────────────────────────
//  Data-fetching layer
//  ⚠️  SWAP POINT — when moving to Supabase, replace the body
//     of this function only. The GET handler below stays the same.
//
//  Example Supabase swap:
//    const { data, error } = await supabase.from("products").select("*");
//    if (error) throw error;
//    return data as Product[];
// ─────────────────────────────────────────────────────────────

async function fetchAllProducts(): Promise<Product[]> {
  // Currently: return in-memory seed data
  return PRODUCTS_SEED;
}

// ─────────────────────────────────────────────────────────────
//  GET /api/products
//  Query params:
//    ?search=<string>   — case-insensitive match on name
//    ?category=<string> — exact match on category (case-insensitive)
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
    const category = searchParams.get("category")?.trim().toLowerCase() ?? "";

    let products = await fetchAllProducts();

    if (search) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    if (category) {
      products = products.filter((p) =>
        p.category.toLowerCase() === category
      );
    }

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}