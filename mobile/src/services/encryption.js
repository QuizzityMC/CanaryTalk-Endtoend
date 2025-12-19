import sodium from 'react-native-sodium';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EncryptionService {
  constructor() {
    this.ready = false;
    this.keyPair = null;
  }

  async init() {
    await sodium.ready;
    this.sodium = sodium;
    this.ready = true;
    
    // Load or generate key pair
    const storedKeys = await this.loadKeysFromStorage();
    if (storedKeys) {
      this.keyPair = storedKeys;
    } else {
      await this.generateKeyPair();
    }
  }

  async generateKeyPair() {
    const keyPair = await this.sodium.crypto_box_keypair();
    this.keyPair = {
      publicKey: await this.sodium.to_base64(keyPair.publicKey),
      privateKey: await this.sodium.to_base64(keyPair.privateKey)
    };
    await this.saveKeysToStorage();
    return this.keyPair;
  }

  async saveKeysToStorage() {
    if (this.keyPair) {
      await AsyncStorage.setItem('encryptionKeys', JSON.stringify(this.keyPair));
    }
  }

  async loadKeysFromStorage() {
    const stored = await AsyncStorage.getItem('encryptionKeys');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  getPublicKey() {
    return this.keyPair?.publicKey;
  }

  async encrypt(message, recipientPublicKey) {
    if (!this.ready || !this.keyPair) {
      throw new Error('Encryption not initialized');
    }

    const nonce = await this.sodium.randombytes_buf(this.sodium.crypto_box_NONCEBYTES);
    const messageBytes = await this.sodium.from_string(message);
    const publicKeyBytes = await this.sodium.from_base64(recipientPublicKey);
    const privateKeyBytes = await this.sodium.from_base64(this.keyPair.privateKey);

    const encrypted = await this.sodium.crypto_box_easy(
      messageBytes,
      nonce,
      publicKeyBytes,
      privateKeyBytes
    );

    return {
      nonce: await this.sodium.to_base64(nonce),
      ciphertext: await this.sodium.to_base64(encrypted)
    };
  }

  async decrypt(encryptedData, senderPublicKey) {
    if (!this.ready || !this.keyPair) {
      throw new Error('Encryption not initialized');
    }

    try {
      const nonce = await this.sodium.from_base64(encryptedData.nonce);
      const ciphertext = await this.sodium.from_base64(encryptedData.ciphertext);
      const publicKeyBytes = await this.sodium.from_base64(senderPublicKey);
      const privateKeyBytes = await this.sodium.from_base64(this.keyPair.privateKey);

      const decrypted = await this.sodium.crypto_box_open_easy(
        ciphertext,
        nonce,
        publicKeyBytes,
        privateKeyBytes
      );

      return await this.sodium.to_string(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Failed to decrypt message]';
    }
  }
}

export default new EncryptionService();
