# CodeToCommerce — Admin Panel Prompts

Adds admin functionality on top of the existing app. No secrets involved — any teammate with bandwidth can run these. Prompt 1 must run first; Prompts 3 and 4 can then run in parallel.

---

## Prompt 1 — Admin access control

```
Add an admin access system to the app:
1) Add a NEXT_PUBLIC_ADMIN_EMAILS environment variable containing a comma-separated
list of admin email addresses. Add it (empty value) to .env.local.example.
2) Create lib/isAdmin.ts exporting isAdmin(email: string | null | undefined): boolean
that checks if the given email is in that list.
3) In app/admin/layout.tsx, check the signed-in Firebase user's email using
isAdmin(). If they're not signed in or not an admin, show a "Not authorized"
message with a link back to the homepage, instead of rendering admin content.
Do not modify any existing customer-facing pages or components.
```

## Prompt 2 — Admin dashboard overview

```
Build app/admin/page.tsx as the admin dashboard home. Show summary cards:
total orders, total pending orders, total paid orders, and total products,
fetched from Supabase via lib/supabase.ts (do not modify lib/supabase.ts).
Follow the existing design system (theme colors, lucide-react icons, no
emoji, mobile-first). Add a simple sidebar or top nav within the admin
section linking to "Products" and "Orders".
```

## Prompt 3 — Product management

```
Build an admin products management screen:
1) app/api/admin/products/route.ts: GET (list all products), POST (create a
product). app/api/admin/products/[id]/route.ts: PATCH (update a product),
DELETE (delete a product) — all via lib/supabase.ts (do not modify it).
2) app/admin/products/page.tsx: a table listing all products (name, price,
category, stock) with Edit and Delete buttons (lucide-react icons, no
emoji), and an "Add Product" form/modal for all product fields. Follow the
existing design system and mobile-first rules. Show a confirmation step
before deleting.
```

## Prompt 4 — Order management

```
Build an admin orders management screen:
1) app/api/admin/orders/route.ts: GET all orders with their order_items via
lib/supabase.ts (do not modify it).
2) app/api/admin/orders/[id]/route.ts: PATCH to update an order's status
(e.g. "shipped", "delivered").
3) app/admin/orders/page.tsx: a table listing all orders (customer name,
total, status, date) with a status filter dropdown, and a way to change an
order's status inline. Follow the existing design system and mobile-first
rules.
```

## Prompt 5 — Link it in for admins only

```
In components/Navbar.tsx, if the signed-in user's email passes isAdmin()
from lib/isAdmin.ts (do not modify that file), show an extra "Admin" link
(lucide-react icon, no emoji) in the navbar that goes to /admin. Hide it
completely for non-admin or signed-out users.
```
