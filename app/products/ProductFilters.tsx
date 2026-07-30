"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Tees", value: "tees" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Accessories", value: "accessories" },
];

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  /** Build a new query string, preserving unrelated params. */
  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({ search: e.target.value })}`
      );
    });
  }

  function handleCategory(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({ category: e.target.value })}`
      );
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center transition-opacity duration-200 ${
        isPending ? "opacity-50 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={18}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          id="product-search"
          type="search"
          placeholder="Search products…"
          defaultValue={currentSearch}
          onChange={handleSearch}
          aria-label="Search products"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow"
        />
      </div>

      {/* Category dropdown */}
      <div className="sm:w-52">
        <select
          id="product-category"
          value={currentCategory}
          onChange={handleCategory}
          aria-label="Filter by category"
          className="w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition-shadow cursor-pointer"
        >
          {CATEGORIES.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
