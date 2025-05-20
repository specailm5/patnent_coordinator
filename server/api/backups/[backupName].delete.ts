import { defineEventHandler, getRouterParam } from 'h3';
import * as fsp from 'fs/promises';
import path from 'path';
import { BACKUPS_DIR } from '../../utils/backupUtils';

export default defineEventHandler(async (event) => {
  const backupName = getRouterParam(event, 'backupName');
  
  if (!backupName || !backupName.startsWith('backup-')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid backup name format.',
    });
  }

  const backupPath = path.join(BACKUPS_DIR, backupName);

  try {
    await fsp.access(backupPath);
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Backup not found.',
    });
  }

  try {
    await fsp.rm(backupPath, { recursive: true, force: true });
    return { success: true, message: 'Backup deleted successfully.' };
  } catch (error) {
    console.error(`[Backup Delete] Error deleting backup ${backupName}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete backup.',
    });
  }
});
