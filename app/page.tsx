import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import type { Product } from "@/app/api/products/route";

async function getFeaturedProducts(): Promise<Product[]> {
  // Fetch from the in-memory API route directly on the server.
  // When Supabase is wired in, only the route changes — this call stays the same.
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.products as Product[]).slice(0, 8);
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ── Top navigation ── */}
      <Navbar />

      {/* ── Hero banner ── */}
      <Hero />

      {/* ── Featured Products ── */}
      <main id="featured-products" className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-muted">
              Hand-picked drops to start some conversations.
            </p>
          </div>
          <a
            href="/products"
            className="mt-3 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline sm:mt-0"
          >
            View all
          </a>
        </div>

        {/* Responsive grid: 1 → 2 → 3 → 4 columns */}
        {products.length > 0 ? (
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
        ) : (
          <p className="py-20 text-center text-muted">
            No products available right now.
          </p>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
