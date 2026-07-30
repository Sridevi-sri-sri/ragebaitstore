<<<<<<< HEAD
import type { Metadata } from "next";
import type { Product } from "@/app/api/products/route";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const res = await fetch(`http://localhost:3000/api/products`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  const products = data.products as Product[];
  return products.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "This product could not be found in the RageBait Store catalog.",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | RageBait Store`,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | RageBait Store`,
      description: product.description,
    },
  };
}

export default function ProductPage() {
  return <div>Product Detail</div>;
=======
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductPageProps {
  params: { slug: string };
}

// Placeholder — replace with real Supabase/API fetch when product data is wired
async function getProduct(slug: string) {
  return {
    id: slug,
    slug,
    name: 'Sample Product',
    price: 29.99,
    image: '/placeholder.png',
    description: 'This is a placeholder product description.',
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetail slug={params.slug} />;
}

function ProductDetail({ slug }: { slug: string }) {
  const { addToCart, user, openDrawer } = useCart();
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'auth-error' | 'error'>('idle');

  // Placeholder product data (swap with a real fetch/query later)
  const product = {
    id: slug,
    slug,
    name: 'Sample Product',
    price: 29.99,
    image: '/placeholder.png',
    description: 'This is a placeholder product description.',
  };

  async function handleAddToCart() {
    if (!user) {
      setStatus('auth-error');
      return;
    }
    setStatus('loading');
    try {
      await addToCart(product.id, qty);
      setStatus('success');
      openDrawer();
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6 justify-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-muted">{product.description}</p>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <label htmlFor="qty" className="text-sm font-medium text-foreground">
                Qty
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="w-16 rounded-lg border border-border bg-surface px-3 py-1.5 text-center text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Add to cart button */}
            <button
              id="add-to-cart-btn"
              type="button"
              disabled={status === 'loading'}
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ShoppingCart size={16} aria-hidden="true" />
              {status === 'loading' ? 'Adding…' : 'Add to Cart'}
            </button>

            {/* Feedback messages */}
            {status === 'success' && (
              <div role="status" className="flex items-center gap-2 text-sm text-success">
                <CheckCircle size={16} aria-hidden="true" />
                Added to cart!
              </div>
            )}
            {status === 'auth-error' && (
              <div role="alert" className="flex items-center gap-2 text-sm text-error">
                <AlertCircle size={16} aria-hidden="true" />
                Please{' '}
                <a href="/login" className="underline font-medium">
                  sign in
                </a>{' '}
                to add items to your cart.
              </div>
            )}
            {status === 'error' && (
              <div role="alert" className="flex items-center gap-2 text-sm text-error">
                <AlertCircle size={16} aria-hidden="true" />
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
>>>>>>> e959cf90517301da4c775f712a2f24fee941d607
}