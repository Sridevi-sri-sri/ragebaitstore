import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  slug: string;
}

export default function ProductCard({ image, name, price, slug }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-lg">
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-background">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Product Name */}
        <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
          {name}
        </h3>

        {/* Price */}
        <p className="text-lg font-bold text-primary">
          ${price.toFixed(2)}
        </p>

        {/* View Product Button */}
        <Link
          href={`/products/${slug}`}
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}