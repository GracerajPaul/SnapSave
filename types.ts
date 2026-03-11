
export enum ExpiryOption {
  ONE_DAY = '24h',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  NEVER = 'never'
}

export interface VaultImage {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  telegramFileId: string; // Hidden in "real" backend, but used here for simulation
  uploadedAt: number;
  url: string; // Blob or Data URL for preview
}

export interface Vault {
  id: string;
  username: string;
  vaultName: string;
  pinHash: string;
  images: VaultImage[];
  createdAt: number;
  expiry: ExpiryOption;
  isEmergencyLocked: boolean;
  failedAttempts: number;
  isViewOnly: boolean;
}

export interface AppState {
  currentVault: Vault | null;
  isAuthenticated: boolean;
  isLocked: boolean;
}

export const isVaultExpired = (vault: Vault): boolean => {
  if (vault.expiry === ExpiryOption.NEVER) return false;
  
  const now = Date.now();
  const created = vault.createdAt;
  let duration = 0;
  
  switch (vault.expiry) {
    case ExpiryOption.ONE_DAY: duration = 24 * 60 * 60 * 1000; break;
    case ExpiryOption.SEVEN_DAYS: duration = 7 * 24 * 60 * 60 * 1000; break;
    case ExpiryOption.THIRTY_DAYS: duration = 30 * 24 * 60 * 60 * 1000; break;
  }
  
  return now > (created + duration);
};
