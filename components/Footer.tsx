import { ShoppingBag } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        {/* Store name */}
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight">RageBait Store</span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted">
          &copy; {year} RageBait Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}