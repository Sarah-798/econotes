"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, onAuthStateChanged, type User, type Auth } from "firebase/auth";
import { getFirestore, onSnapshot, type Firestore, type Query, type DocumentReference, DocumentData } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// --- Context Definition ---
interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
});

export const useFirebase = () => useContext(FirebaseContext);

// --- Provider Component ---
interface FirebaseClientProviderProps {
  children: ReactNode;
  options?: FirebaseOptions; // optional to fix your layout error
}

export function FirebaseClientProvider({ children, options }: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
  });

  useEffect(() => {
    const firebaseConfig: FirebaseOptions = options || {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    };

    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);

      setFirebase({ app, auth, db, storage });
    } else {
      console.warn("⚠️ Firebase config missing! Check your .env.local values.");
    }
  }, [options]);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

// --- Custom Hooks ---

export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  return { user, loading, signOut: () => auth?.signOut() };
}

export function useFirestore() {
  return useFirebase().db;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    if (!query) return;
    const unsub = onSnapshot(query, (snapshot) =>
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T)))
    );
    return () => unsub();
  }, [query]);
  return data;
}

export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    if (!docRef) return;
    const unsub = onSnapshot(docRef, (doc) => {
      setData({ id: doc.id, ...doc.data() } as T);
    });
    return () => unsub();
  }, [docRef]);
  return data;
}
