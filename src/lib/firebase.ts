import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfigJson from "../../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore, Storage & Auth services with explicit databaseId
const dbId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== "(default)"
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firestore Quota Detection & Graceful Fallback
let quotaExceededState = false;
const QUOTA_FLAG_KEY = "firestore_quota_exceeded";
const QUOTA_FLAG_TIMESTAMP_KEY = "firestore_quota_exceeded_at";
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000; // treat quota as reset after 12 hours

export function isFirestoreQuotaExceeded(): boolean {
  if (quotaExceededState) return true;
  try {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(QUOTA_FLAG_KEY) === "true") {
      // Auto-expire the flag so a stale flag from hours ago doesn't block syncing forever,
      // even after Firebase's own daily quota has actually reset.
      const markedAt = Number(sessionStorage.getItem(QUOTA_FLAG_TIMESTAMP_KEY) || 0);
      if (markedAt && Date.now() - markedAt > QUOTA_COOLDOWN_MS) {
        sessionStorage.removeItem(QUOTA_FLAG_KEY);
        sessionStorage.removeItem(QUOTA_FLAG_TIMESTAMP_KEY);
        quotaExceededState = false;
        return false;
      }
      quotaExceededState = true;
      return true;
    }
  } catch (e) {}
  return false;
}

export function markFirestoreQuotaExceeded(): void {
  quotaExceededState = true;
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(QUOTA_FLAG_KEY, "true");
      sessionStorage.setItem(QUOTA_FLAG_TIMESTAMP_KEY, String(Date.now()));
    }
  } catch (e) {}
}

export function isQuotaError(err: unknown): boolean {
  if (!err) return false;
  const msg = typeof err === "object" && err !== null && "message" in err ? String((err as { message?: unknown }).message) : String(err);
  const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code?: unknown }).code) : "";
  return (
    code.includes("resource-exhausted") ||
    msg.includes("resource-exhausted") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("Quota exceeded")
  );
}

// Initialize Analytics conditionally
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics errors in unsupported environments
  });
}

