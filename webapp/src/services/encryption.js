import _sodium from 'libsodium-wrappers';

class EncryptionService {
  constructor() {
    this.ready = false;
    this.keyPair = null;
  }

  async init() {
    await _sodium.ready;
    this.sodium = _sodium;
    this.ready = true;
    
    // Load or generate key pair
    const storedKeys = this.loadKeysFromStorage();
    if (storedKeys) {
      this.keyPair = storedKeys;
    } else {
      this.generateKeyPair();
    }
  }

  generateKeyPair() {
    const keyPair = this.sodium.crypto_box_keypair();
    this.keyPair = {
      publicKey: this.sodium.to_base64(keyPair.publicKey),
      privateKey: this.sodium.to_base64(keyPair.privateKey)
    };
    this.saveKeysToStorage();
    return this.keyPair;
  }

  saveKeysToStorage() {
    if (this.keyPair) {
      localStorage.setItem('encryptionKeys', JSON.stringify(this.keyPair));
    }
  }

  loadKeysFromStorage() {
    const stored = localStorage.getItem('encryptionKeys');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  getPublicKey() {
    return this.keyPair?.publicKey;
  }

  encrypt(message, recipientPublicKey) {
    if (!this.ready || !this.keyPair) {
      throw new Error('Encryption not initialized');
    }

    const nonce = this.sodium.randombytes_buf(this.sodium.crypto_box_NONCEBYTES);
    const messageBytes = this.sodium.from_string(message);
    const publicKeyBytes = this.sodium.from_base64(recipientPublicKey);
    const privateKeyBytes = this.sodium.from_base64(this.keyPair.privateKey);

    const encrypted = this.sodium.crypto_box_easy(
      messageBytes,
      nonce,
      publicKeyBytes,
      privateKeyBytes
    );

    return {
      nonce: this.sodium.to_base64(nonce),
      ciphertext: this.sodium.to_base64(encrypted)
    };
  }

  decrypt(encryptedData, senderPublicKey) {
    if (!this.ready || !this.keyPair) {
      throw new Error('Encryption not initialized');
    }

    try {
      const nonce = this.sodium.from_base64(encryptedData.nonce);
      const ciphertext = this.sodium.from_base64(encryptedData.ciphertext);
      const publicKeyBytes = this.sodium.from_base64(senderPublicKey);
      const privateKeyBytes = this.sodium.from_base64(this.keyPair.privateKey);

      const decrypted = this.sodium.crypto_box_open_easy(
        ciphertext,
        nonce,
        publicKeyBytes,
        privateKeyBytes
      );

      return this.sodium.to_string(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Failed to decrypt message]';
    }
  }
}

export default new EncryptionService();
