
import bcrypt from 'bcryptjs';

/**
 * Service to handle PIN hashing and verification using bcrypt.
 * In a real-world scenario, hashing would happen on the server.
 */
export const AuthService = {
  /**
   * Hashes a 4-6 digit PIN.
   */
  async hashPin(pin: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pin, salt);
  },

  /**
   * Verifies a PIN against a hash.
   */
  async verifyPin(pin: string, hash: string): Promise<boolean> {
    return bcrypt.compare(pin, hash);
  }
};
