
import { createClient } from '@supabase/supabase-js';
import { Vault, ExpiryOption, VaultImage } from '../types.ts';

const SUPABASE_URL = 'https://pamzmgeqpmjbwunamdyn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhbXptZ2VxcG1qYnd1bmFtZHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzMyNjcsImV4cCI6MjA4NzAwOTI2N30.ai-q6zWAI_mz9P9ZKFtG2jbx0w-Ig3Gy9YFKu7wn4JI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * StorageService 2.0 - Powered by Supabase
 * Handles all cloud database operations for vaults and their associated image streams.
 */
export const StorageService = {
  
  async createVault(params: {
    username: string;
    vaultName: string;
    pinHash: string;
    expiry: ExpiryOption;
  }): Promise<Vault> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    return data ? this._mapVault(data) : null;
  },

  async getVaultById(id: string): Promise<Vault | null> {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? this._mapVault(data) : null;
  },

  async updateVaultImages(id: string, images: VaultImage[]): Promise<Vault> {
    const { data, error } = await supabase
      .from('vaults')
      .update({ images })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapVault(data);
  },

  async updateVaultSettings(id: string, updates: Partial<Vault>): Promise<Vault> {
    // Map camelCase to snake_case for Supabase
    const dbUpdates: any = {};
    if (updates.vaultName !== undefined) dbUpdates.vault_name = updates.vaultName;
    if (updates.isEmergencyLocked !== undefined) dbUpdates.is_emergency_locked = updates.isEmergencyLocked;
    if (updates.isViewOnly !== undefined) dbUpdates.is_view_only = updates.isViewOnly;
    if (updates.failedAttempts !== undefined) dbUpdates.failed_attempts = updates.failedAttempts;

    const { data, error } = await supabase
      .from('vaults')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this._mapVault(data);
  },

  async incrementFailedAttempts(id: string): Promise<number> {
    const vault = await this.getVaultById(id);
    if (!vault) return 0;

    const newAttempts = vault.failedAttempts + 1;
    const isLocked = newAttempts >= 5;

    const { data, error } = await supabase
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
    const { error } = await supabase
      .from('vaults')
      .update({ failed_attempts: 0 })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteVault(id: string) {
    const { error } = await supabase
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
