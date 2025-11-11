"use client";

import { ReactNode, createContext, useContext } from "react";
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, onSnapshot, Query } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useState, useEffect } from "react";
import type { FirebaseOptions } from 'firebase/app';

let app;
let auth;
let db;
let storage;

const FirebaseContext = createContext<{
  app: ReturnType<typeof initializeApp> | null;
  auth: ReturnType<typeof getAuth> | null;
  db: ReturnType<typeof getFirestore> | null;
  storage: ReturnType<typeof getStorage> | null;
}>({ app: null, auth: null, db: null, storage: null });

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [firebase, setFirebase] = useState<{
        app: ReturnType<typeof initializeApp> | null;
        auth: ReturnType<typeof getAuth> | null;
        db: ReturnType<typeof getFirestore> | null;
        storage: ReturnType<typeof getStorage> | null;
    }>({ app: null, auth: null, db: null, storage: null });

    useEffect(() => {
        const firebaseConfig: FirebaseOptions = {
            apiKey: localStorage.getItem('NEXT_PUBLIC_FIREBASE_API_KEY') || '',
            authDomain: localStorage.getItem('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || '',
            projectId: localStorage.getItem('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || '',
        };

        if (firebaseConfig.projectId) {
            app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);
            db = getFirestore(app);
            storage = getStorage(app);
            setFirebase({ app, auth, db, storage });
        }
    }, []);


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
        };
        const unsub = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsub();
    }, [auth]);

    return { user, loading, signOut: () => auth?.signOut() };
}

export function useFirestore() {
  const { db } = useFirebase();
  return db;
}

export function useAuth() {
  const { auth } = useFirebase();
  return auth;
}

export function useCollection<T = any>(query: Query | null) {
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

export function useDoc<T = any>(docRef: any) {
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

// --- Export everything needed ---
export { app, auth, db, storage };
