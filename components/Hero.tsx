import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full bg-surface py-24 sm:py-32 overflow-hidden border-b border-border">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-surface to-accent opacity-50" />
      
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Streetwear That <span className="text-primary">Starts Conversations</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          Unapologetic designs for people who refuse to blend in. Shop our latest drop of bold graphic tees, hoodies, and accessories.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            Shop the Drop <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}