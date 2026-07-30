import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "./ProductFilters";
import type { Product } from "@/app/api/products/route";

// ─────────────────────────────────────────────────────────────
//  Data fetching (server-side)
// ─────────────────────────────────────────────────────────────

async function getProducts(
  search: string,
  category: string
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);

  // Use an absolute URL so Next.js server-side fetch works correctly.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  const res = await fetch(
    `${baseUrl}/api/products${params.size ? `?${params}` : ""}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const data = await res.json();
  return data.products as Product[];
}

// ─────────────────────────────────────────────────────────────
//  Page component (Server Component)
// ─────────────────────────────────────────────────────────────

interface ProductsPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { search = "", category = "" } = await searchParams;

  let products: Product[] = [];
  let fetchError = false;

  try {
    products = await getProducts(search, category);
  } catch {
    fetchError = true;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* ── Page Header ── */}
      <section className="bg-secondary py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Shop All Products
          </h1>
          <p className="mt-2 text-secondary-foreground/70 text-sm sm:text-base">
            {products.length} item{products.length !== 1 ? "s" : ""} found
            {category ? ` in "${category}"` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Filters (client island) ── */}
        <div className="mb-8">
          <Suspense fallback={<div className="h-11 rounded-lg bg-border/40 animate-pulse" />}>
            <ProductFilters />
          </Suspense>
        </div>

        {/* ── Error state ── */}
        {fetchError && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-6 py-8 text-center">
            <p className="font-semibold text-error">
              Could not load products. Please try again later.
            </p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!fetchError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="text-5xl font-black text-border select-none">0</p>
            <p className="text-lg font-semibold text-foreground">
              No products found
            </p>
            <p className="text-sm text-muted max-w-xs">
              Try a different search term or remove the category filter.
            </p>
          </div>
        )}

        {/* ── Product grid ── */}
        {!fetchError && products.length > 0 && (
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  image={product.image_url}
                  name={product.name}
                  price={product.price}
                  slug={product.slug}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}