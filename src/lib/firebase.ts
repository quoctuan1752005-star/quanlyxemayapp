/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  enableIndexedDbPersistence
} from 'firebase/firestore';

let app;
let db: any;
let auth: any;
let isFirebaseAvailable = false;

// Helper initializer used by ensureFirebaseInitialized
function initFirebaseWithConfig(firebaseConfig: any) {
  try {
    if (!firebaseConfig || !firebaseConfig.apiKey) return false;
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    isFirebaseAvailable = true;
    console.log('Firebase initialized with project ID:', firebaseConfig.projectId);

    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed-precondition (multiple tabs open)');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence unimplemented in this browser');
      }
    });

    getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase connection tested: Client is offline');
      }
    });

    return true;
  } catch (e) {
    console.warn('initFirebaseWithConfig failed', e);
    return false;
  }
}

// First try Vite environment variables (recommended for hosting platforms)
try {
  const viteEnv = (import.meta as any)?.env;
  const envApiKey = viteEnv && viteEnv.VITE_FIREBASE_API_KEY ? viteEnv.VITE_FIREBASE_API_KEY : undefined;

  if (envApiKey) {
    const firebaseConfig = {
      apiKey: viteEnv.VITE_FIREBASE_API_KEY,
      authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: viteEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: viteEnv.VITE_FIREBASE_APP_ID,
      measurementId: viteEnv.VITE_FIREBASE_MEASUREMENT_ID,
      firestoreDatabaseId: viteEnv.VITE_FIRESTORE_DATABASE_ID
    } as any;

    initFirebaseWithConfig(firebaseConfig);
  } else {
    // Fallback to JSON file (useful for local dev without env vars)
    import('../../firebase-applet-config.json')
      .then((configModule) => {
        const firebaseConfig = configModule.default;
        if (firebaseConfig && firebaseConfig.apiKey) {
          initFirebaseWithConfig(firebaseConfig);
        }
      })
      .catch((err) => {
        console.warn('Could not load firebase-applet-config.json. Using fully functional local storage mock sync.', err);
      });
  }
} catch (e) {
  console.warn('Firebase setup failed to initialize. Running offline mock mode.', e);
}

// Ensure function: attempts to initialize Firebase synchronously (from env or bundled json)
export async function ensureFirebaseInitialized(timeoutMs = 5000): Promise<boolean> {
  if (isFirebaseAvailable) return true;
  try {
    const viteEnv = (import.meta as any)?.env;
    const envApiKey = viteEnv && viteEnv.VITE_FIREBASE_API_KEY ? viteEnv.VITE_FIREBASE_API_KEY : undefined;
    if (envApiKey) {
      const firebaseConfig = {
        apiKey: viteEnv.VITE_FIREBASE_API_KEY,
        authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: viteEnv.VITE_FIREBASE_PROJECT_ID,
        storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: viteEnv.VITE_FIREBASE_APP_ID,
        measurementId: viteEnv.VITE_FIREBASE_MEASUREMENT_ID,
        firestoreDatabaseId: viteEnv.VITE_FIRESTORE_DATABASE_ID
      } as any;
      initFirebaseWithConfig(firebaseConfig);
      return isFirebaseAvailable;
    }

    // Try loading local JSON if present
    try {
      const cfg = await import('../../firebase-applet-config.json');
      const firebaseConfig = cfg.default;
      if (firebaseConfig && firebaseConfig.apiKey) {
        initFirebaseWithConfig(firebaseConfig);
        return isFirebaseAvailable;
      }
    } catch (e) {
      // ignore
    }

    // Wait briefly in case top-level dynamic import is still resolving
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (isFirebaseAvailable) return true;
      await new Promise(r => setTimeout(r, 200));
    }
    return isFirebaseAvailable;
  } catch (e) {
    return false;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { 
  app, 
  db, 
  auth, 
  isFirebaseAvailable,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  doc
};

export type { FirebaseUser };

