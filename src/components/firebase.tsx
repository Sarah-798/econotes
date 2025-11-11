"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import {
  initializeApp,
  getApp,
  getApps,
  FirebaseApp,
  FirebaseOptions,
} from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  onSnapshot,
  Query,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- Firebase configuration from .env.local ---
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// --- Initialize Firebase only once ---
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- Context setup ---
const FirebaseContext = createContext({
  app,
  auth,
  db,
  storage,
});

export const useFirebase = () => useContext(FirebaseContext);

// --- Provider for Next.js ---
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseContext.Provider value={{ app, auth, db, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// --- Hooks ---

// 🔹 Authenticated user hook
export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  return { user, loading, signOut: () => auth.signOut() };
}

// 🔹 Firestore reference hook
export function useFirestore() {
  const { db } = useFirebase();
  return db;
}

// 🔹 Auth reference hook
export function useAuth() {
  const { auth } = useFirebase();
  return auth;
}

// 🔹 Realtime collection listener hook
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!query) return;
    const unsub = onSnapshot(query, (snapshot) => {
      setData(
        snapshot.docs.map(
          (doc: QueryDocumentSnapshot<T>) =>
            ({ id: doc.id, ...doc.data() } as T)
        )
      );
    });
    return () => unsub();
  }, [query]);

  return data;
}

// 🔹 Realtime document listener hook
export function useDoc<T = DocumentData>(docRef: any) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (!docRef) return;
    const unsub = onSnapshot(docRef, (doc: DocumentSnapshot<T>) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() } as T);
      } else {
        setData(null);
      }
    });
    return () => unsub();
  }, [docRef]);

  return data;
}

// --- Export everything needed ---
export { app, auth, db, storage };
