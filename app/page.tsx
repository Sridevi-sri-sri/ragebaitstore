import { ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── TEMPORARY DESIGN-SYSTEM DEMO ── remove after confirmation ── */}
      <section className="mx-auto max-w-xl px-4 py-12 flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Design System Demo
        </h1>

        {/* Color swatches */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-primary p-4 text-primary-foreground text-sm font-medium">
            primary
          </div>
          <div className="rounded-lg bg-secondary p-4 text-secondary-foreground text-sm font-medium">
            secondary
          </div>
          <div className="rounded-lg bg-accent p-4 text-foreground text-sm font-medium">
            accent
          </div>
          <div className="rounded-lg bg-surface border border-border p-4 text-foreground text-sm font-medium">
            surface
          </div>
          <div className="rounded-lg bg-success p-4 text-primary-foreground text-sm font-medium">
            success
          </div>
          <div className="rounded-lg bg-error p-4 text-primary-foreground text-sm font-medium">
            error
          </div>
        </div>

        {/* Lucide icon smoke-test */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-sm text-muted">
            Lucide icon rendering correctly
          </span>
        </div>
      </section>
      {/* ── END DEMO ── */}

    </main>
  );
}
