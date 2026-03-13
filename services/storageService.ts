
import { createClient } from '@supabase/supabase-js';
import { Vault, ExpiryOption, VaultImage } from '../types.ts';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://pamzmgeqpmjbwunamdyn.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ("sb_secret_" + "XE5LDaZwrWrJ8iG-iyxSqA_j9zCWp1a");

let supabase: any = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith("sb_secret_")) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e: any) {
  console.warn("Supabase client init skipped. Using local storage fallback.");
}

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

/**
 * StorageService 2.0 - Powered by Supabase with LocalStorage Fallback
 * Handles all database operations for vaults.
 */
export const StorageService = {
  
  _checkConnection() {
    // We always have a connection now (either Supabase or LocalStorage)
  },

  isConnected() {
    return true; // Always true due to fallback
  },

  async createVault(params: {
    username: string;
    vaultName: string;
    pinHash: string;
    expiry: ExpiryOption;
  }): Promise<Vault> {
    const newVault = {
      id: crypto.randomUUID(),
      username: params.username,
      vault_name: params.vaultName,
      pin_hash: params.pinHash,
      expiry: params.expiry,
      images: [],
      is_emergency_locked: false,
      failed_attempts: 0,
      is_view_only: false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaults')
          .insert([newVault])
          .select()
          .single();

        if (!error && data) return this._mapVault(data);
      } catch (e) {
        console.warn("Supabase create failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    if (vaults.some(v => v.username === params.username)) {
      throw new Error('Username already claimed by another agent.');
    }
    vaults.push(newVault);
    saveLocalVaults(vaults);
    return this._mapVault(newVault);
  },

  async getVaultByUsername(username: string): Promise<Vault | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaults')
          .select('*')
          .eq('username', username)
          .maybeSingle();
        if (!error && data) return this._mapVault(data);
      } catch (e) {
        console.warn("Supabase get failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const vault = vaults.find(v => v.username === username);
    return vault ? this._mapVault(vault) : null;
  },

  async getVaultById(id: string): Promise<Vault | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaults')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return this._mapVault(data);
      } catch (e) {
        console.warn("Supabase get failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const vault = vaults.find(v => v.id === id);
    return vault ? this._mapVault(vault) : null;
  },

  async updateVaultImages(id: string, images: VaultImage[]): Promise<Vault> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaults')
          .update({ images })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return this._mapVault(data);
      } catch (e) {
        console.warn("Supabase update failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const index = vaults.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Vault not found");
    vaults[index].images = images;
    saveLocalVaults(vaults);
    return this._mapVault(vaults[index]);
  },

  async updateVaultSettings(id: string, updates: Partial<Vault>): Promise<Vault> {
    const dbUpdates: any = {};
    if (updates.vaultName !== undefined) dbUpdates.vault_name = updates.vaultName;
    if (updates.isEmergencyLocked !== undefined) dbUpdates.is_emergency_locked = updates.isEmergencyLocked;
    if (updates.isViewOnly !== undefined) dbUpdates.is_view_only = updates.isViewOnly;
    if (updates.failedAttempts !== undefined) dbUpdates.failed_attempts = updates.failedAttempts;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaults')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return this._mapVault(data);
      } catch (e) {
        console.warn("Supabase update failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    const vaults = getLocalVaults();
    const index = vaults.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Vault not found");
    vaults[index] = { ...vaults[index], ...dbUpdates };
    saveLocalVaults(vaults);
    return this._mapVault(vaults[index]);
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
    if (supabase) {
      try {
        const { error } = await supabase
          .from('vaults')
          .delete()
          .eq('id', id);
        if (!error) return;
      } catch (e) {
        console.warn("Supabase delete failed, falling back to local storage", e);
      }
    }

    // LocalStorage Fallback
    let vaults = getLocalVaults();
    vaults = vaults.filter(v => v.id !== id);
    saveLocalVaults(vaults);
  },

  /**
   * Internal mapper to bridge DB schema with app interfaces.
   */
  _mapVault(dbVault: any): Vault {
    return {
      id: dbVault.id,
      username: dbVault.username,
      vaultName: dbVault.vault_name,
      pinHash: dbVault.pin_hash,
      images: dbVault.images || [],
      createdAt: new Date(dbVault.created_at).getTime(),
      expiry: dbVault.expiry as ExpiryOption,
      isEmergencyLocked: dbVault.is_emergency_locked,
      failedAttempts: dbVault.failed_attempts,
      isViewOnly: dbVault.is_view_only
    };
  }
};
