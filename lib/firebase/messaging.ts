import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let messaging: Messaging | null = null;

function getFirebaseApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (messaging) return messaging;

  try {
    const app = getFirebaseApp();
    messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.warn('[AethLife FCM] Messaging init failed:', err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const permitted = await requestNotificationPermission();
  if (!permitted) return null;

  const msg = getFirebaseMessaging();
  if (!msg) return null;

  try {
    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    });
    return token || null;
  } catch (err) {
    console.warn('[AethLife FCM] Token fetch failed:', err);
    return null;
  }
}

export function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
) {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};

  const unsubscribe = onMessage(msg, callback);
  return unsubscribe;
}

export async function saveFCMToken(userId: string, token: string): Promise<void> {
  await fetch('/api/notifications/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}
