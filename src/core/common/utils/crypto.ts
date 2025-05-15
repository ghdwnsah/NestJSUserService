import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = process.env.CLIENT_CODE_SECRET || 'your-32byte-secret-key-string!!!'; // 반드시 32 bytes
const ivLength = 16; // AES block size

export function encryptClientCode(clientCode: string): string {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(clientCode, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // IV와 암호화된 문자열을 같이 리턴
}

export function decryptClientCode(encrypted: string): string {
    console.log('encrypted:', encrypted);

  const [ivHex, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}