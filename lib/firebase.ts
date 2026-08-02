"use client";

/**
 * lib/firebase.ts
 *
 * Firebase app initialisation + Auth helpers.
 * All config is read exclusively from NEXT_PUBLIC_* env vars — no hardcoded values.
 *
 * When Firebase env vars are not set (e.g. local dev without .env.local),
 * the module initialises gracefully without throwing, and all auth helpers
 * return early with a clear console warning instead of crashing the app.
 *
 * Exports:
 *   app              — the initialised FirebaseApp, or null if unconfigured
 *   auth             — the Auth instance, or null if unconfigured
 *   isFirebaseReady  — boolean flag; check this before calling auth helpers
 *   signInWithGoogle — triggers Google popup sign-in
 *   signOutUser      — signs the current user out
 *   useAuthState     — React hook that tracks auth state changes
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  Config — sourced exclusively from environment variables
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Guard — only initialise when credentials are present
// ─────────────────────────────────────────────────────────────────────────────

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!isConfigured && typeof window !== "undefined") {
  console.warn(
    "[firebase] Missing NEXT_PUBLIC_FIREBASE_* env vars. " +
    "Copy .env.local.example → .env.local and fill in your Firebase credentials. " +
    "Auth features will be disabled until then."
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Singleton initialisation — skipped when config is absent
// ─────────────────────────────────────────────────────────────────────────────

export let app:  FirebaseApp | null = null;
export let auth: Auth        | null = null;

if (isConfigured) {
  app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

/** True when Firebase has been initialised with valid credentials. */
export const isFirebaseReady = isConfigured;

// ─────────────────────────────────────────────────────────────────────────────
//  Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google sign-in popup and returns the signed-in User.
 * Throws if Firebase is not configured or the popup is closed/errors.
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth) throw new Error("[firebase] Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* vars to .env.local.");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Signs the current user out of Firebase Auth.
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

// ─────────────────────────────────────────────────────────────────────────────
//  React hook — subscribe to auth state changes
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user:    User | null;
  loading: boolean;
}

/**
 * useAuthState
 *
 * Returns { user, loading }.
 * - `loading` is true until Firebase resolves the persisted session (or
 *    immediately false when Firebase is not configured).
 * - `user` is null when signed out or Firebase is unconfigured.
 */
export function useAuthState(): AuthState {
  const [user,    setUser   ] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured); // no loading if unconfigured

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}