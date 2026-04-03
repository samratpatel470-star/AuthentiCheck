import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function redeemCode(code: string, userId: string) {
  try {
    await runTransaction(db, async (transaction) => {
      // 1. Check if code exists and is not used
      const codeRef = doc(db, 'redeem_codes', code);
      const codeDoc = await transaction.get(codeRef);
      
      if (!codeDoc.exists()) {
        throw new Error('Invalid redeem code.');
      }
      
      if (codeDoc.data().isUsed) {
        throw new Error('This code has already been used.');
      }
      
      // 2. Mark code as used
      transaction.update(codeRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      
      // 3. Update user profile to Pro
      const userRef = doc(db, 'users', userId);
      transaction.set(userRef, {
        uid: userId,
        isPro: true,
        proUnlockedAt: serverTimestamp()
      }, { merge: true });
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `redeem_codes/${code}`);
    return false;
  }
}

export async function getUserProStatus(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() && userDoc.data().isPro === true;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    return false;
  }
}

export async function generateRedeemCode() {
  try {
    const code = Math.random().toString(36).substring(2, 14).toUpperCase();
    const codeRef = doc(db, 'redeem_codes', code);
    await setDoc(codeRef, {
      code,
      isUsed: false,
      createdAt: serverTimestamp()
    });
    return code;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'redeem_codes');
    return null;
  }
}

export async function createCustomRedeemCode(code: string) {
  try {
    const codeRef = doc(db, 'redeem_codes', code.toUpperCase());
    const codeDoc = await getDoc(codeRef);
    if (codeDoc.exists()) {
      throw new Error('Code already exists.');
    }
    await setDoc(codeRef, {
      code: code.toUpperCase(),
      isUsed: false,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `redeem_codes/${code}`);
    return false;
  }
}
