import { readdir, access, mkdir } from 'fs/promises';
// import { statSync } from 'fs'; // statSync is not used for directory size in this version
import path from 'path';

const backupsDir = path.resolve(process.cwd(), 'server', 'backups');
const MAX_BACKUPS = 10;

// Ensure backups directory exists
async function ensureBackupsDir() {
  try {
    await access(backupsDir);
  } catch {
    await mkdir(backupsDir, { recursive: true });
  }
}

export default defineEventHandler(async (event) => {
  await ensureBackupsDir();

  try {
    const entries = await readdir(backupsDir, { withFileTypes: true });
    const backupDirs = entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith('backup-'))
      .map(entry => {
        const dirName = entry.name;
        try {
          // Extract date from directory name: backup-YYYY-MM-DD-HHMMSS
          const year = parseInt(dirName.substring(7, 11));
          const month = parseInt(dirName.substring(12, 14)) - 1; // JS months are 0-indexed
          const day = parseInt(dirName.substring(15, 17));
          const hour = parseInt(dirName.substring(18, 20));
          const minute = parseInt(dirName.substring(20, 22));
          const second = parseInt(dirName.substring(22, 24));

          if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second)) {
            console.error(`[API Backups GET] Invalid date components parsed for directory: ${dirName}`);
            return null; // Skip this directory due to parsing error
          }

          const date = new Date(year, month, day, hour, minute, second);
          if (isNaN(date.getTime())) { // Check if the constructed date is valid
            console.error(`[API Backups GET] Failed to create valid date for directory: ${dirName}`);
            return null; // Skip this directory due to invalid date
          }

          return {
            name: dirName, // This is the backup set identifier
            date: date,   // Keep as Date object for sorting
            // Size is omitted for directories in this version for simplicity.
            // If needed, it would require iterating files inside each dir and summing their sizes.
          };
        } catch (e) {
          console.error(`[API Backups GET] Error processing directory ${dirName} in .map():`, e);
          return null; // Mark as problematic to be filtered out
        }
      })
      .filter(backup => backup !== null) as { name: string; date: Date; }[]; // Type assertion after filtering nulls

    // Sort by date (newest first)
    const sortedBackups = backupDirs.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      success: true,
      backups: sortedBackups.slice(0, MAX_BACKUPS).map(b => ({
        ...b,
        date: b.date.toISOString(), // Convert date to ISO string for JSON response
        // Add a placeholder or indicator that this is a directory/set if needed by UI
        // e.g., type: 'directory'
      })),
    };
  } catch (error: any) {
    console.error('[API Backups GET] Critical error in GET /api/backups handler:', error);
    return {
      success: false,
      message: 'Failed to list backups.',
      error: error.message,
    };
  }
});
