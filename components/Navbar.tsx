"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Menu,
  X,
  Zap,
  LogIn,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import Link from "next/link";

// Firebase helpers — implemented in lib/firebase.ts (T10).
// Imported lazily via type-safe optional calls so the Navbar
// compiles even before Firebase is fully wired up.
import type { User as FirebaseUser } from "firebase/auth";

let _signInWithGoogle: (() => Promise<void>) | undefined;
let _signOutUser: (() => Promise<void>) | undefined;
let _onAuthStateChanged:
  | ((cb: (u: FirebaseUser | null) => void) => () => void)
  | undefined;

// Dynamic import so Firebase SDK is not bundled until used.
async function loadFirebase() {
  if (_signInWithGoogle) return; // already loaded
  try {
    const mod = await import("@/lib/firebase");
    _signInWithGoogle = (mod as any).signInWithGoogle;
    _signOutUser = (mod as any).signOutUser;
    _onAuthStateChanged = (mod as any).onAuthStateChanged;
  } catch {
    // Firebase not yet configured — silently no-op
  }
}

// ─────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
];

const CART_ITEM_COUNT = 0;

// ─────────────────────────────────────────────────────────────
//  UserMenu — shown when signed in
// ─────────────────────────────────────────────────────────────

interface UserMenuProps {
  user: FirebaseUser;
}

function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await loadFirebase();
    await _signOutUser?.();
  }

  const displayName = user.displayName ?? "Account";
  const photoURL = user.photoURL;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        id="user-menu-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="user-dropdown"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
      >
        {/* Avatar */}
        {photoURL ? (
          <Image
            src={photoURL}
            alt={displayName}
            width={28}
            height={28}
            className="rounded-full ring-2 ring-primary/40 object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground">
            <User size={14} aria-hidden="true" />
          </span>
        )}

        {/* Name — hidden on very small screens */}
        <span className="hidden sm:block text-sm font-medium text-primary-foreground max-w-[120px] truncate">
          {displayName}
        </span>

        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`text-secondary-foreground/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          id="user-dropdown"
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {user.email}
            </p>
          </div>

          {/* Sign out */}
          <button
            role="menuitem"
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-background hover:text-primary transition-colors duration-150"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Navbar
// ─────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Persist login across refresh via onAuthStateChanged listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    loadFirebase().then(() => {
      if (_onAuthStateChanged) {
        unsubscribe = _onAuthStateChanged((firebaseUser) => {
          setUser(firebaseUser);
          setAuthReady(true);
        });
      } else {
        // Firebase not configured yet — mark ready so UI doesn't flash
        setAuthReady(true);
      }
    });

    return () => unsubscribe?.();
  }, []);

  async function handleSignIn() {
    await loadFirebase();
    await _signInWithGoogle?.();
  }

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

          {/* ── Right Side: Auth + Cart + Mobile Toggle ── */}
          <div className="flex items-center gap-2">

            {/* Auth — only render after auth state is known to avoid flash */}
            {authReady && (
              user ? (
                <UserMenu user={user} />
              ) : (
                <button
                  id="sign-in-button"
                  type="button"
                  onClick={handleSignIn}
                  className="hidden sm:flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-white/20 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
                >
                  <LogIn size={15} aria-hidden="true" />
                  Sign in
                </button>
              )
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label={`Cart (${CART_ITEM_COUNT} items)`}
              className="relative flex items-center justify-center w-10 h-10 rounded-md text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
            >
              <ShoppingCart size={22} aria-hidden="true" />
              {CART_ITEM_COUNT > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none"
                >
                  {CART_ITEM_COUNT > 99 ? "99+" : CART_ITEM_COUNT}
                </span>
              )}
            </Link>

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
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
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

          {/* Mobile sign-in / sign-out */}
          {authReady && (
            <div className="mt-2 pt-2 border-t border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    setMobileOpen(false);
                    await loadFirebase();
                    await _signOutUser?.();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignIn();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-secondary-foreground/80 hover:text-primary-foreground hover:bg-white/10 transition-colors duration-150"
                >
                  <LogIn size={15} aria-hidden="true" />
                  Sign in with Google
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}