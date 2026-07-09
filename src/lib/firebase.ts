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
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
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

try {
  // Load config
  import('../../firebase-applet-config.json')
    .then((configModule) => {
      const firebaseConfig = configModule.default;
      if (firebaseConfig && firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
        auth = getAuth(app);
        isFirebaseAvailable = true;
        console.log("Firebase initialized successfully with project ID:", firebaseConfig.projectId);

        // Try to enable offline persistence for Firestore
        enableIndexedDbPersistence(db).catch((err) => {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.
            console.warn("Firestore persistence failed-precondition (multiple tabs open)");
          } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn("Firestore persistence unimplemented in this browser");
          }
        });

        // Test connection
        getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.warn("Firebase connection tested: Client is offline");
          }
        });
      }
    })
    .catch((err) => {
      console.warn("Could not load firebase-applet-config.json. Using fully functional local storage mock sync.", err);
    });
} catch (e) {
  console.warn("Firebase setup failed to initialize. Running offline mock mode.", e);
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
  onAuthStateChanged,
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
  doc
};

export type { FirebaseUser };

