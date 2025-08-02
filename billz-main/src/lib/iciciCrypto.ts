// utils/IciciCrypto.ts

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';


export class IciciCrypto {
  private static readonly AES_ALGO = 'aes-128-cbc';


  private static getPublicKey(): forge.pki.rsa.PublicKey {
    try {
      const certPath = path.join(process.cwd(), 'certificates', 'icici_public.cer');
      const certPem = fs.readFileSync(certPath, 'utf8');

      // Parse the certificate
      const cert = forge.pki.certificateFromPem(certPem);

      // Extract the public key from the certificate
      const publicKey = cert.publicKey;

      return publicKey;
    } catch (error) {
      console.error('Failed to read or parse ICICI public certificate:', error);
      throw new Error('Failed to read ICICI public certificate');
    }
  }

 
  private static getPrivateKey(): string {
    try {
      const privateKeyPath = path.join(process.cwd(), 'certificates', 'privateBillzzy.key');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      return privateKey;
    } catch (error) {
      console.error('Failed to read private key:', error);
      throw new Error('Failed to read private key');
    }
  }


  public static encrypt<T>(jsonPayload: T) {
    // Generate a random 16-byte AES session key
    const sessionKey = crypto.randomBytes(16);

    // Generate a random 16-byte Initialization Vector (IV)
    const iv = crypto.randomBytes(16);

    // Extract the public key from the certificate
    const publicKey = this.getPublicKey();

    // Encrypt the sessionKey using RSA with PKCS1 padding using node-forge
    const encryptedKeyForge = publicKey.encrypt(sessionKey.toString('binary'), 'RSAES-PKCS1-V1_5');
    const encryptedKeyBuffer = Buffer.from(encryptedKeyForge, 'binary');

    // Convert the JSON payload to a string and then to a Buffer
    const jsonString = JSON.stringify(jsonPayload);
    const jsonBuffer = Buffer.from(jsonString, 'utf8');

    // Encrypt the JSON payload using AES-128-CBC with the sessionKey and iv
    const cipher = crypto.createCipheriv(this.AES_ALGO, sessionKey, iv);
    let encryptedDataBuffer = cipher.update(jsonBuffer);
    encryptedDataBuffer = Buffer.concat([encryptedDataBuffer, cipher.final()]);

    // Return the encrypted components in Base64 encoding
    return {
      encryptedKey: encryptedKeyBuffer.toString('base64'),
      iv: iv.toString('base64'),
      encryptedData: encryptedDataBuffer.toString('base64'),
    };
  }

 
  static decrypt(encryptedData: string, encryptedKey: string, iv?: string) {
    try {
      // Step 1: Decode the Base64-encoded encryptedKey and encryptedData
      const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');
      let encryptedDataBuffer = Buffer.from(encryptedData, 'base64');

      let ivBuffer: Buffer;

      if (iv && iv.trim() !== '') {
        // IV is provided separately
        ivBuffer = Buffer.from(iv, 'base64');
      } else {
        // IV is embedded in the first 16 bytes of encryptedData
        if (encryptedDataBuffer.length < 16) {
          throw new Error('Encrypted data is too short to contain an IV.');
        }
        ivBuffer = encryptedDataBuffer.slice(0, 16);
        encryptedDataBuffer = encryptedDataBuffer.slice(16); // Remaining data is the actual ciphertext
      }

      // Step 2: Decrypt the sessionKey using the private key with PKCS1 padding using node-forge
      const privateKeyPem = this.getPrivateKey();
      const privateKeyForge = forge.pki.privateKeyFromPem(privateKeyPem);
      const decryptedKeyForge = privateKeyForge.decrypt(encryptedKeyBuffer.toString('binary'), 'RSAES-PKCS1-V1_5');
      const sessionKey = Buffer.from(decryptedKeyForge, 'binary');

      // Validate the length of the sessionKey
      if (sessionKey.length !== 16) {
        throw new Error(`Invalid session key length: ${sessionKey.length} bytes`);
      }

      // Step 3: Decrypt the encryptedData using AES-128-CBC with the sessionKey and iv
      const decipher = crypto.createDecipheriv(this.AES_ALGO, sessionKey, ivBuffer);
      let decrypted = decipher.update(encryptedDataBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      // Step 4: Parse the decrypted data as JSON
      const decryptedJson = JSON.parse(decrypted.toString('utf8'));
      return decryptedJson;
    } catch (error: any) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}
