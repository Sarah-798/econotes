'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
  options: FirebaseOptions;
}

export function FirebaseClientProvider({
  children,
  options,
}: FirebaseClientProviderProps) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp | undefined;
    auth: Auth | undefined;
    firestore: Firestore | undefined;
  } | null>(null);

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase(options);
    setFirebase({ app, auth, firestore });
  }, [options]);

  if (!firebase?.app) {
    return (
       <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <FirebaseProvider
      app={firebase.app}
      auth={firebase.auth as Auth}
      firestore={firebase.firestore as Firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
