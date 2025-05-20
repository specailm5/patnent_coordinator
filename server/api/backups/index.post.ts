import { defineEventHandler } from 'h3';
import fs from 'fs/promises'; // Using fs/promises for async operations
import path from 'path';
import { 
  ensureBackupsDir, 
  manageOldBackups, 
  getFormattedDate,
  SOURCE_DATA_DIR,
  DB_FILES_TO_BACKUP,
  BACKUPS_DIR
} from '../../utils/backupUtils'; // Updated import

export default defineEventHandler(async (event) => {
  try {
    await ensureBackupsDir(); // From backupUtils
    await manageOldBackups(); // From backupUtils

    const timestamp = getFormattedDate(new Date()); // From backupUtils
    const newBackupDirName = `backup-${timestamp}`;
    const newBackupPath = path.join(BACKUPS_DIR, newBackupDirName); // Use BACKUPS_DIR from backupUtils

    await fs.mkdir(newBackupPath, { recursive: true });

    let allFilesBackedUp = true;
    let firstErrorMessage = '';

    for (const dbFile of DB_FILES_TO_BACKUP) { // Use DB_FILES_TO_BACKUP from backupUtils
      const sourceDbPath = path.join(SOURCE_DATA_DIR, dbFile); // Use SOURCE_DATA_DIR from backupUtils
      const backupDbPath = path.join(newBackupPath, dbFile);

      try {
        await fs.access(sourceDbPath); // Check if source DB file exists
        await fs.copyFile(sourceDbPath, backupDbPath);
        console.log(`[API Backup POST] Copied ${dbFile} to ${backupDbPath}`);
      } catch (dbCopyError: any) {
        allFilesBackedUp = false;
        const errorMessage = `Error copying database file ${dbFile} from ${sourceDbPath}: ${dbCopyError.message}`;
        console.warn(`[API Backup POST] ${errorMessage}`);
        if (!firstErrorMessage) firstErrorMessage = errorMessage;
      }
    }

    if (!allFilesBackedUp) {
      console.warn(`[API Backup POST] Manual backup in directory ${newBackupDirName} completed with one or more errors.`);
      return { 
        success: true, 
        message: `Backup partially created in ${newBackupDirName}. Some files may be missing. First error: ${firstErrorMessage}`,
        backupDirName: newBackupDirName 
      };
    }

    console.log(`[API Backup POST] Manual backup created successfully in ${newBackupPath}`);
    return { 
      success: true, 
      message: 'Backup created successfully.', 
      backupDirName: newBackupDirName 
    };

  } catch (error: any) {
    console.error('[API Backup POST] Error creating manual backup:', error);
    return { 
      success: false, 
      message: 'Failed to create backup.', 
      error: error.message 
    };
  }
});
