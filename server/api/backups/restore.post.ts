import fs from 'fs/promises';
import path from 'path';

const backupsDir = path.resolve(process.cwd(), 'server', 'backups');

// Define target database configurations (where to restore to)
const targetDbConfigs = [
  { name: 'data.db', path: path.resolve(process.cwd(), 'server', 'data', 'data.db') },
  { name: 'archive_data.db', path: path.resolve(process.cwd(), 'server', 'data', 'archive_data.db') }
];

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName: backupDirName } = body; // fileName from client now refers to the backup directory name

  if (!backupDirName || typeof backupDirName !== 'string' || !backupDirName.startsWith('backup-')) {
    return {
      success: false,
      message: 'Invalid backup directory name provided.',
    };
  }

  const backupSourcePath = path.join(backupsDir, backupDirName);

  try {
    // Check if backup directory exists
    await fs.access(backupSourcePath);

    let allFilesRestored = true;
    let firstErrorMessage = '';

    for (const dbConfig of targetDbConfigs) {
      const sourceFileInBackup = path.join(backupSourcePath, dbConfig.name);
      const targetDbPath = dbConfig.path;
      const targetDir = path.dirname(targetDbPath); // Get the directory of the target path

      try {
        await fs.mkdir(targetDir, { recursive: true }); // Ensure target directory exists
        await fs.access(sourceFileInBackup); // Check if the specific DB file exists in the backup directory
        await fs.copyFile(sourceFileInBackup, targetDbPath);
        console.log(`[API Restore POST] Successfully restored ${dbConfig.name} from ${backupDirName} to ${targetDbPath}.`);
      } catch (dbError: any) {
        allFilesRestored = false;
        const errorMessage = `Error accessing or copying ${dbConfig.name} from backup ${backupDirName}: ${dbError.message}`;
        console.error(`[API Restore POST] ${errorMessage}`);
        if (!firstErrorMessage) firstErrorMessage = errorMessage;
        // If one file fails to restore, we continue trying to restore others.
      }
    }

    if (!allFilesRestored) {
      return {
        success: false,
        message: `Failed to restore one or more database files from ${backupDirName}. First error: ${firstErrorMessage}`,
      };
    }

    console.warn(`[API Restore POST] IMPORTANT: If you are using a file-based database like SQLite, you may need to restart the server for changes to be fully reflected in the application.`);
    return {
      success: true,
      message: `All database files successfully restored from ${backupDirName}.`,
    };
  } catch (error: any) {
    console.error(`[API Restore POST] Error restoring backup from directory ${backupDirName}:`, error);
    if (error.code === 'ENOENT' && error.path === backupSourcePath) { // Check if the error is for the main backup directory
      return {
        success: false,
        message: `Backup directory ${backupDirName} not found.`,
      };
    }
    return {
      success: false,
      message: `Failed to restore backup from ${backupDirName}.`,
      error: error.message,
    };
  }
});
