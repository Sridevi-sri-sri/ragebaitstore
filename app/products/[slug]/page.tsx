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
}