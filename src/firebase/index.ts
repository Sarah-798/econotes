/**
 * @fileoverview This file exports all of the Firebase-related functionality.
 */
import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
  getApps,
} from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// ✅ Correct exports — removed old ./provider imports
export { FirebaseClientProvider, useFirebase, useFirestore, useAuth } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser, UserProvider } from './user-provider';

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let auth: Auth | undefined;

/**
 * Initializes the Firebase app and returns the app, firestore, and auth instances.
 * @param options The Firebase options.
 * @returns The Firebase app, firestore, and auth instances.
 */
export function initializeFirebase(options: FirebaseOptions) {
  if (getApps().length === 0) {
    app = initializeApp(options);
    firestore = getFirestore(app);
    auth = getAuth(app);
  }

  return { app, firestore, auth };
}
