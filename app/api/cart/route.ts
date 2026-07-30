import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ─── Shared response helpers ──────────────────────────────────────────────────

function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function err(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ─── GET /api/cart?user_id=<uid> ─────────────────────────────────────────────
// Returns all cart_items rows belonging to the given user.

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get('user_id');

  if (!user_id) {
    return err('Missing required query parameter: user_id', 400);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true });

  if (error) return err(error.message, 500);

  return ok(data);
}

// ─── POST /api/cart ───────────────────────────────────────────────────────────
// Body: { user_id: string, product_id: string, quantity: number }
// Inserts a new cart_items row and returns the created record.

export async function POST(req: NextRequest) {
  let body: { user_id?: string; product_id?: string; quantity?: number };

  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body', 400);
  }

  const { user_id, product_id, quantity } = body;

  if (!user_id || !product_id || quantity == null) {
    return err('Missing required fields: user_id, product_id, quantity', 400);
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return err('quantity must be a positive integer', 400);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({ user_id, product_id, quantity })
    .select()
    .single();

  if (error) return err(error.message, 500);

  return ok(data, 201);
}

// ─── PATCH /api/cart ──────────────────────────────────────────────────────────
// Body: { id: string, quantity: number }
// Updates the quantity of an existing cart_items row.

export async function PATCH(req: NextRequest) {
  let body: { id?: string; quantity?: number };

  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body', 400);
  }

  const { id, quantity } = body;

  if (!id || quantity == null) {
    return err('Missing required fields: id, quantity', 400);
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    return err('quantity must be a positive integer', 400);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select()
    .single();

  if (error) return err(error.message, 500);
  if (!data) return err('Cart item not found', 404);

  return ok(data);
}

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
// Body: { id: string }
// Removes a cart_items row by id.

export async function DELETE(req: NextRequest) {
  let body: { id?: string };

  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body', 400);
  }

  const { id } = body;

  if (!id) {
    return err('Missing required field: id', 400);
  }

  const { error, count } = await supabase
    .from('cart_items')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) return err(error.message, 500);
  if (count === 0) return err('Cart item not found', 404);

  return ok({ id, deleted: true });
}