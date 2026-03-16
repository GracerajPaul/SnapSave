
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase.ts';
import { Vault, ExpiryOption, VaultImage } from '../types.ts';

// LocalStorage Fallback Implementation
const LOCAL_STORAGE_KEY = 'snapsave_vaults_db';

const getLocalVaults = (): any[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalVaults = (vaults: any[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vaults));
  } catch (e) {
    console.warn("Failed to save to localStorage", e);
  }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * StorageService 3.0 - Powered by Firebase Firestore
 * Handles all database operations for vaults.
 */
export const StorageService = {
  _isOffline: false,

  setOfflineMode(isOffline: boolean) {
    this._isOffline = isOffline;
    console.log(`[STORAGE] Mode set to: ${isOffline ? 'LOCAL_ONLY' : 'CLOUD_SYNC'}`);
  },

  isConnected() {
    return !this._isOffline && !!auth.currentUser;
  },

  async createVault(params: {
    username: string;
    vaultName: string;
    pinHash: string;
    expiry: ExpiryOption;
  }): Promise<Vault> {
    const vaultId = crypto.randomUUID();
    console.log(`[STORAGE] Initiating vault creation for: ${params.username} (ID: ${vaultId})`);
    
    const newVault: any = {
      id: vaultId,
      username: params.username,
      vaultName: params.vaultName,
      pinHash: params.pinHash,
      expiry: params.expiry,
      images: [],
      isEmergencyLocked: false,
      failedAttempts: 0,
      isViewOnly: false,
      createdAt: Date.now()
    };

    try {
      if (this._isOffline) throw new Error('Offline mode active');
      // Check if username exists
      console.log(`[STORAGE] Checking username availability: ${params.username}`);
      const q = query(collection(db, 'vaults'), where('username', '==', params.username), limit(1));
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'vaults');
        return newVault; // unreachable
      }

      if (!querySnapshot.empty) {
        console.warn(`[STORAGE] Username conflict: ${params.username}`);
        throw new Error('Username already claimed by another agent.');
      }

      console.log(`[STORAGE] Persisting vault to Firestore...`);
      try {
        await setDoc(doc(db, 'vaults', vaultId), newVault);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `vaults/${vaultId}`);
      }
      console.log(`[STORAGE] Vault successfully persisted to cloud.`);
      return newVault as Vault;
    } catch (e: any) {
      if (e.message === 'Username already claimed by another agent.') throw e;
      // If it's a Firestore error (JSON), re-throw it so ErrorBoundary catches it
      if (e.message.startsWith('{')) throw e;

      console.error("[STORAGE] Cloud persistence failed, engaging local redundancy", e);
      
      // LocalStorage Fallback
      const vaults = getLocalVaults();
      if (vaults.some(v => v.username === params.username)) {
        throw new Error('Username already claimed by another agent.');
      }
      vaults.push(newVault);
      saveLocalVaults(vaults);
      console.log(`[STORAGE] Vault successfully persisted to local redundancy.`);
      return newVault as Vault;
    }
  },

  async getVaultByUsername(username: string): Promise<Vault | null> {
    try {
      if (this._isOffline) throw new Error('Offline mode active');
      const q = query(collection(db, 'vaults'), where('username', '==', username), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Vault;
      }
    } catch (e) {
      console.warn("Firebase get failed, falling back to local storage", e);
      // We don't call handleFirestoreError here because we want the fallback to work silently if possible
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const vault = vaults.find(v => v.username === username);
    return vault || null;
  },

  async getVaultById(id: string): Promise<Vault | null> {
    try {
      if (this._isOffline) throw new Error('Offline mode active');
      const docRef = doc(db, 'vaults', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Vault;
      }
    } catch (e) {
      console.warn("Firebase get failed, falling back to local storage", e);
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const vault = vaults.find(v => v.id === id);
    return vault || null;
  },

  async updateVaultImages(id: string, images: VaultImage[]): Promise<Vault> {
    try {
      if (this._isOffline) throw new Error('Offline mode active');
      const docRef = doc(db, 'vaults', id);
      await updateDoc(docRef, { images });
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.data() as Vault;
    } catch (e) {
      console.warn("Firebase update failed, falling back to local storage", e);
      // If it's a permission error, we should probably know
      if (e instanceof Error && e.message.includes('permission')) {
        handleFirestoreError(e, OperationType.UPDATE, `vaults/${id}`);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const index = vaults.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Vault not found");
    vaults[index].images = images;
    saveLocalVaults(vaults);
    return vaults[index] as Vault;
  },

  async updateVaultSettings(id: string, updates: Partial<Vault>): Promise<Vault> {
    try {
      if (this._isOffline) throw new Error('Offline mode active');
      const docRef = doc(db, 'vaults', id);
      await updateDoc(docRef, updates);
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.data() as Vault;
    } catch (e) {
      console.warn("Firebase update failed, falling back to local storage", e);
      if (e instanceof Error && e.message.includes('permission')) {
        handleFirestoreError(e, OperationType.UPDATE, `vaults/${id}`);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const index = vaults.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Vault not found");
    vaults[index] = { ...vaults[index], ...updates };
    saveLocalVaults(vaults);
    return vaults[index] as Vault;
  },

  async incrementFailedAttempts(id: string): Promise<number> {
    const vault = await this.getVaultById(id);
    if (!vault) return 0;

    const newAttempts = vault.failedAttempts + 1;
    const isLocked = newAttempts >= 5;

    await this.updateVaultSettings(id, { failedAttempts: newAttempts, isEmergencyLocked: isLocked });
    return newAttempts;
  },

  async resetFailedAttempts(id: string) {
    await this.updateVaultSettings(id, { failedAttempts: 0 });
  },

  async deleteVault(id: string) {
    try {
      if (this._isOffline) throw new Error('Offline mode active');
      await deleteDoc(doc(db, 'vaults', id));
    } catch (e) {
      console.warn("Firebase delete failed, falling back to local storage", e);
      if (e instanceof Error && e.message.includes('permission')) {
        handleFirestoreError(e, OperationType.DELETE, `vaults/${id}`);
      }
    }

    // LocalStorage Fallback
    let vaults = getLocalVaults();
    vaults = vaults.filter(v => v.id !== id);
    saveLocalVaults(vaults);
  }
};

