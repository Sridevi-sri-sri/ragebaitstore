"use client";

/**
 * lib/firebase.ts
 *
 * Firebase app initialisation + Auth helpers.
 * All config is read exclusively from NEXT_PUBLIC_* env vars — no hardcoded values.
 *
 * Exports:
 *   app              — the initialised FirebaseApp singleton
 *   auth             — the Auth instance
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
//  Singleton initialisation — safe for Next.js hot-reload / multiple imports
// ─────────────────────────────────────────────────────────────────────────────

export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);

// ─────────────────────────────────────────────────────────────────────────────
//  Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google sign-in popup and returns the signed-in User.
 * Throws if the popup is closed or an error occurs.
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Signs the current user out of Firebase Auth.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// ─────────────────────────────────────────────────────────────────────────────
//  React hook — subscribe to auth state changes
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * useAuthState
 *
 * Returns { user, loading }.
 * - `loading` is true until Firebase resolves the persisted session.
 * - `user` is null when signed out, a User object when signed in.
 *
 * Usage:
 *   const { user, loading } = useAuthState();
 */
export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return { user, loading };
}