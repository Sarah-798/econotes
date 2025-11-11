'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
        console.error("Error fetching document:", err);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
