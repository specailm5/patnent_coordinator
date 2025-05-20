import { defineEventHandler, readMultipartFormData } from 'h3';
import * as fsp from 'fs/promises';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import crypto from 'crypto';
import { BACKUPS_DIR, DB_FILES_TO_BACKUP, ensureBackupsDir, manageOldBackups, getFormattedDate } from '../../utils/backupUtils';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);
const ENCRYPTION_KEY_ENV_VAR = 'BACKUP_ENCRYPTION_KEY';
const IV_LENGTH = 12; // For AES-GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env[ENCRYPTION_KEY_ENV_VAR];
  if (!key || key.length !== 32) {
    console.error(`[Backup Import] Critical: ${ENCRYPTION_KEY_ENV_VAR} environment variable must be set and be 32 characters long for AES-256.`);
    throw new Error('Encryption key is not configured correctly for import.');
  }
  return Buffer.from(key, 'utf-8');
}

export default defineEventHandler(async (event) => {
  const multipartFormData = await readMultipartFormData(event);
  const uploadedFile = multipartFormData?.find(part => part.name === 'backupFile');

  if (!uploadedFile || !uploadedFile.data || !uploadedFile.filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No backup file uploaded or file is empty.',
    });
  }

  if (!uploadedFile.filename.endsWith('.zip.enc')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file type. Only .zip.enc files are allowed.',
    });
  }

  await ensureBackupsDir();

  const encryptionKey = getEncryptionKey();
  
  // Create a temporary path for the uploaded encrypted file
  const tempEncryptedFilePath = path.join(BACKUPS_DIR, `temp-${Date.now()}-${uploadedFile.filename}`);
  await fsp.writeFile(tempEncryptedFilePath, uploadedFile.data);

  // Read the IV from the beginning of the file
  const fileHandle = await fsp.open(tempEncryptedFilePath, 'r');
  const ivBuffer = Buffer.alloc(IV_LENGTH);
  await fileHandle.read(ivBuffer, 0, IV_LENGTH, 0);
  const iv = ivBuffer;

  // Read the auth tag from the end of the file
  const stats = await fsp.stat(tempEncryptedFilePath);
  const authTagBuffer = Buffer.alloc(AUTH_TAG_LENGTH);
  await fileHandle.read(authTagBuffer, 0, AUTH_TAG_LENGTH, stats.size - AUTH_TAG_LENGTH);
  await fileHandle.close();

  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
  decipher.setAuthTag(authTagBuffer);

  // Create a new backup directory for the imported files
  let backupDirName = uploadedFile.filename.replace('.zip.enc', '');
  if (!backupDirName.startsWith('backup-')) {
    backupDirName = `backup-${getFormattedDate(new Date())}-imported`;
  }
  const importBackupPath = path.join(BACKUPS_DIR, backupDirName);
  
  try {
    await fsp.mkdir(importBackupPath, { recursive: true });

    // Create a readable stream for the encrypted data (excluding IV and auth tag)
    const encryptedDataStream = fs.createReadStream(tempEncryptedFilePath, { 
      start: IV_LENGTH, 
      end: stats.size - AUTH_TAG_LENGTH - 1 
    });

    // Decrypt and unzip
    await pipeline(
      encryptedDataStream,
      decipher,
      unzipper.Parse()
        .on('entry', async (entry: unzipper.Entry) => {
          const fileName = entry.path;
          const type = entry.type;
          if (type === 'File' && DB_FILES_TO_BACKUP.includes(fileName)) {
            const filePath = path.join(importBackupPath, fileName);
            console.log(`[Backup Import] Extracting ${fileName} to ${filePath}`);
            entry.pipe(fs.createWriteStream(filePath))
              .on('error', (err: Error) => console.error(`[Backup Import] Error writing file ${fileName}:`, err));
          } else {
            console.log(`[Backup Import] Skipping entry: ${fileName} (Type: ${type})`);
            entry.autodrain();
          }
        })
        .on('finish', () => {
          console.log('[Backup Import] Unzipping finished.');
        })
        .on('error', (err) => {
          console.error('[Backup Import] Error during unzipping process:', err);
          throw err;
        })
    );

    console.log(`[Backup Import] Backup imported successfully into ${importBackupPath}`);
    
    await manageOldBackups();

    return { 
      success: true, 
      message: 'Backup imported successfully.', 
      backupDirName 
    };

  } catch (error: any) {
    console.error('[Backup Import] Error importing backup:', error);
    if (importBackupPath) {
      await fsp.rm(importBackupPath, { recursive: true, force: true })
        .catch(rmErr => console.error(`[Backup Import] Failed to cleanup partial import directory ${importBackupPath}:`, rmErr));
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to import backup.',
      data: { details: error.message }
    });
  } finally {
    await fsp.unlink(tempEncryptedFilePath)
      .catch(err => console.warn(`[Backup Import] Could not delete temp file ${tempEncryptedFilePath}:`, err));
  }
});
