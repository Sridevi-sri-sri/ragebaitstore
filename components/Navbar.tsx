"use client";

import { useState } from "react";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full bg-secondary border-b border-border shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo / Store Name ── */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-foreground group shrink-0"
            aria-label="RageBait Store – Home"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-110">
              <Zap size={18} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-bold text-lg tracking-tight text-primary-foreground leading-none">
              Rage<span className="text-primary">Bait</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links (centered) ── */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-4 py-2 rounded-md text-sm font-medium text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Right Side: Cart + Mobile Toggle ── */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Cart (${itemCount} items)`}
              className="relative flex items-center justify-center w-10 h-10 rounded-md text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
            >
              <ShoppingCart size={22} aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Hamburger – mobile only */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
            >
              {mobileOpen ? (
                <X size={22} aria-hidden="true" />
              ) : (
                <Menu size={22} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ── */}
      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 pb-4 pt-1 bg-secondary border-t border-white/10">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 rounded-md text-sm font-medium text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}