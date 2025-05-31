import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your .env file
const envFilePath = join(__dirname, '.env');

// Generate a secure random JWT secret (base64 encoded)
const jwtSecret = randomBytes(32).toString('base64');

// Generate a 32-character backup encryption key (hex encoded to ensure exact 32 characters)
const backupEncryptionKey = randomBytes(16).toString('hex'); // 16 bytes = 32 hex characters

try {
  // Read the current .env file
  let envContent = readFileSync(envFilePath, 'utf8');
  
  // Replace the placeholder values with the generated secrets
  envContent = envContent.replace(/JWT_SECRET=.*$/m, `JWT_SECRET=${jwtSecret}`);
  envContent = envContent.replace(/BACKUP_ENCRYPTION_KEY=.*$/m, `BACKUP_ENCRYPTION_KEY=${backupEncryptionKey}`);
  
  // Write the updated content back to the .env file
  writeFileSync(envFilePath, envContent, 'utf8');
  
  console.log('Success! The .env file has been updated with new secure values:');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`BACKUP_ENCRYPTION_KEY=${backupEncryptionKey}`);
} catch (error) {
  console.error('Error updating .env file:', error.message);
}