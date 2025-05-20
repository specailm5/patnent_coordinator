import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';
import { PassThrough } from 'stream';
import { BACKUPS_DIR, DB_FILES_TO_BACKUP } from '../../../utils/backupUtils';

const ENCRYPTION_KEY_ENV_VAR = 'BACKUP_ENCRYPTION_KEY';
const IV_LENGTH = 12; // For AES-GCM, 12 bytes is optimal
const AUTH_TAG_LENGTH = 16; // GCM authentication tag length

function getEncryptionKey(): Buffer {
  const key = process.env[ENCRYPTION_KEY_ENV_VAR];
  if (!key || key.length !== 32) {
    console.error(`[Backup Export] Critical: ${ENCRYPTION_KEY_ENV_VAR} environment variable must be set and be 32 characters long for AES-256.`);
    throw new Error('Encryption key is not configured correctly.');
  }
  return Buffer.from(key, 'utf-8');
}

function validateBackupName(backupName: string): boolean {
  // Allows format: backup-YYYY-MM-DD-HHMMSS
  return /^backup-\d{4}-\d{2}-\d{2}-\d{6}$/.test(backupName);
}

export default defineEventHandler(async (event) => {
  const backupName = getRouterParam(event, 'backupName');
  if (!backupName || !validateBackupName(backupName)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid backup name format. Expected format: backup-YYYY-MM-DD-HHMMSS',
    });
  }

  const backupDirectoryPath = path.join(BACKUPS_DIR, backupName);

  try {
    await fsp.access(backupDirectoryPath);
  } catch (error) {
    console.error(`[Backup Export] Backup directory not found: ${backupDirectoryPath}`, error);
    throw createError({
      statusCode: 404,
      statusMessage: 'Backup not found.',
    });
  }

  const encryptionKey = getEncryptionKey();
  let iv: Buffer;
  try {
    iv = crypto.randomBytes(IV_LENGTH);
  } catch (error) {
    console.error('[Backup Export] Failed to generate IV:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize encryption.',
    });
  }

  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  // Set headers for file download
  setResponseHeader(event, 'Content-Type', 'application/octet-stream');
  setResponseHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(backupName)}.zip.enc`);
  
  // Create a PassThrough stream to combine IV + encrypted data + auth tag
  const combinedStream = new PassThrough();
  
  // Write IV at the start
  combinedStream.write(iv);
  
  // Pipe archive through cipher to combined stream
  archive.pipe(cipher);
  cipher.pipe(combinedStream, { end: false });
  
  // When cipher ends, append the auth tag and end the combined stream
  cipher.on('end', () => {
    const authTag = cipher.getAuthTag();
    combinedStream.end(authTag);
  });

  // Pipe the combined stream to the response
  combinedStream.pipe(event.node.res);

  // Add files to the archive with error handling
  for (const dbFile of DB_FILES_TO_BACKUP) {
    const filePath = path.join(backupDirectoryPath, dbFile);
    try {
      await fsp.access(filePath);
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (err) => {
        console.error(`[Backup Export] Error reading file ${dbFile}:`, err);
        archive.abort();
      });
      archive.append(fileStream, { name: dbFile });
    } catch (fileError) {
      console.warn(`[Backup Export] File ${dbFile} not found in backup ${backupName}. Skipping.`);
    }
  }

  try {
    await archive.finalize();
    console.log(`[Backup Export] Successfully created and streamed encrypted backup: ${backupName}.zip.enc`);
  } catch (error) {
    console.error('[Backup Export] Error finalizing archive:', error);
    if (!event.node.res.writableEnded) {
      event.node.res.end();
    }
  }
});
