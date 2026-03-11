
import { createClient } from '@supabase/supabase-js';
import { Vault, ExpiryOption, VaultImage } from '../types.ts';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase only if keys are present to prevent crash
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!supabase) {
  console.error("CRITICAL: Supabase environment variables are missing. The vault will not function.");
}

/**
 * StorageService 2.0 - Powered by Supabase
 * Handles all cloud database operations for vaults and their associated image streams.
 */
export const StorageService = {
  
  _checkConnection() {
    if (!supabase) {
      throw new Error('Supabase connection not initialized. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the Settings > Secrets menu in AI Studio.');
    }
  },

  isConnected() {
    return !!supabase;
  },

  async createVault(params: {
    username: string;
    vaultName: string;
    pinHash: string;
    expiry: ExpiryOption;
  }): Promise<Vault> {
    this._checkConnection();
    
    const { data, error } = await supabase!
      .from('vaults')
      .insert([
        {
          username: params.username,
          vault_name: params.vaultName,
          pin_hash: params.pinHash,
          expiry: params.expiry,
          images: [],
          is_emergency_locked: false,
          failed_attempts: 0,
          is_view_only: false
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Username already claimed by another agent.');
      throw new Error(error.message);
    }

    return this._mapVault(data);
  },

  async getVaultByUsername(username: string): Promise<Vault | null> {
    if (!supabase) return null;
    const { data, error } = await supabase!
      .from('vaults')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    return data ? this._mapVault(data) : null;
  },

  async getVaultById(id: string): Promise<Vault | null> {
    if (!supabase) return null;
    const { data, error } = await supabase!
      .from('vaults')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this._mapVault(data) : null;
  },

  async updateVaultImages(id: string, images: VaultImage[]): Promise<Vault> {
    this._checkConnection();
    const { data, error } = await supabase!
      .from('vaults')
      .update({ images })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapVault(data);
  },

  async updateVaultSettings(id: string, updates: Partial<Vault>): Promise<Vault> {
    this._checkConnection();
    // Map camelCase to snake_case for Supabase
    const dbUpdates: any = {};
    if (updates.vaultName !== undefined) dbUpdates.vault_name = updates.vaultName;
    if (updates.isEmergencyLocked !== undefined) dbUpdates.is_emergency_locked = updates.isEmergencyLocked;
    if (updates.isViewOnly !== undefined) dbUpdates.is_view_only = updates.isViewOnly;
    if (updates.failedAttempts !== undefined) dbUpdates.failed_attempts = updates.failedAttempts;

    const { data, error } = await supabase!
      .from('vaults')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapVault(data);
  },

  async incrementFailedAttempts(id: string): Promise<number> {
    if (!supabase) return 0;
    const vault = await this.getVaultById(id);
    if (!vault) return 0;

    const newAttempts = vault.failedAttempts + 1;
    const isLocked = newAttempts >= 5;

    const { data, error } = await supabase!
      .from('vaults')
      .update({ 
        failed_attempts: newAttempts,
        is_emergency_locked: isLocked
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data.failed_attempts;
  },

  async resetFailedAttempts(id: string) {
    if (!supabase) return;
    const { error } = await supabase!
      .from('vaults')
      .update({ failed_attempts: 0 })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteVault(id: string) {
    if (!supabase) return;
    const { error } = await supabase!
      .from('vaults')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
