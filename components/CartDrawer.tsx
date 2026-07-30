'use client';

import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawer() {
  const { items, itemCount, subtotal, loading, isDrawerOpen, closeDrawer, updateQuantity, removeFromCart } =
    useCart();

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* ── Drawer panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-foreground">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-background hover:text-foreground transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-center text-sm text-muted py-8">Loading cart…</p>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingCart className="h-12 w-12 text-border" aria-hidden="true" />
              <p className="text-sm text-muted">Your cart is empty.</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border bg-background p-3"
                >
                  {/* Product image */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name ?? 'Product'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-border" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.name ?? item.product_id}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      ${((item.price ?? 0) * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Minus size={12} aria-hidden="true" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Plus size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    aria-label={`Remove ${item.name ?? 'item'} from cart`}
                    onClick={() => removeFromCart(item.id)}
                    className="self-start flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-error/10 hover:text-error transition-colors"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + checkout */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted font-medium">Subtotal</span>
              <span className="text-base font-bold text-foreground">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <a
              href="/checkout"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-md active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  );
}