/**
 * Crypto utilities for password encryption/decryption using Web Crypto API
 * Works both in browser and Node.js environments
 */

const ENCRYPTION_KEY_SUFFIX = "maturoscope_2024";
const PBKDF2_ITERATIONS = 10000;

export interface EncryptedData {
  encrypted: number[];
  iv: number[];
  salt: number[];
}

/**
 * Encrypt password using AES-GCM with PBKDF2 key derivation
 * @param password - Plain text password to encrypt
 * @param email - User email (used as part of key material)
 * @returns Encrypted data object or plain password as fallback
 */
export const encryptPassword = async (password: string, email: string): Promise<EncryptedData | string> => {
  try {
    // Check if Web Crypto API is available (requires HTTPS in production)
    if (!crypto || !crypto.subtle) {
      console.warn("Web Crypto API not available (requires HTTPS). Using plain password.");
      return password;
    }
    
    // Generate a deterministic key based on email + session info
    const keyMaterial = email + ENCRYPTION_KEY_SUFFIX;
    const encoder = new TextEncoder();
    
    // Derive encryption key using PBKDF2
    const keyBytes = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keyMaterial),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyBytes,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Encrypt password
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedPassword = encoder.encode(password);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedPassword
    );
    
    // Return encrypted data with parameters needed for decryption
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: Array.from(salt)
    };
  } catch (err) {
    console.error("Error encrypting password:", err);
    return password; // Fallback to plain password
  }
};

/**
 * Decrypt password using AES-GCM with PBKDF2 key derivation
 * @param encryptedData - Encrypted data object or plain string
 * @param email - User email (used as part of key material)
 * @returns Decrypted password
 */
export const decryptPassword = async (encryptedData: EncryptedData | string, email: string): Promise<string> => {
  try {
    // If it's a plain string, return as-is (fallback case)
    if (typeof encryptedData === 'string') {
      return encryptedData;
    }

    // Check if Web Crypto API is available (requires HTTPS in production)
    if (!crypto || !crypto.subtle) {
      console.warn("Web Crypto API not available (requires HTTPS). Cannot decrypt.");
      return '';
    }

    // Reconstruct the same key used in encryption
    const keyMaterial = email + ENCRYPTION_KEY_SUFFIX;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Import key material
    const keyBytes = await crypto.subtle.importKey(
      "raw",
      encoder.encode(keyMaterial),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // Derive the same key using the salt from encrypted data
    const salt = new Uint8Array(encryptedData.salt);
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyBytes,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decrypt the password
    const iv = new Uint8Array(encryptedData.iv);
    const encryptedBytes = new Uint8Array(encryptedData.encrypted);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encryptedBytes
    );
    
    return decoder.decode(decrypted);
  } catch (err) {
    console.error("Error decrypting password:", err);
    // If decryption fails, try to use as plain password (fallback)
    return typeof encryptedData === 'string' ? encryptedData : '';
  }
};
