import fs from 'fs/promises';
import path from 'path';

export const MAX_BACKUPS = 10;
export const BACKUPS_DIR = path.resolve(process.cwd(), 'server', 'backups');
export const SOURCE_DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
export const DB_FILES_TO_BACKUP = ['data.db', 'archive_data.db'];

// Function to format date as YYYY-MM-DD-HHMMSS
export function getFormattedDate(date: Date): string {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}-${HH}${mm}${ss}`;
}

// Ensure backups directory exists
export async function ensureBackupsDir(): Promise<void> {
  try {
    await fs.access(BACKUPS_DIR);
  } catch {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
  }
}

interface BackupEntry {
  name: string;
  time: number;
}

// Manage old backups, ensuring MAX_BACKUPS is respected
export async function manageOldBackups(): Promise<void> {
  await ensureBackupsDir();
  const entries = await fs.readdir(BACKUPS_DIR, { withFileTypes: true });

  const backupDirsWithTime: BackupEntry[] = (await Promise.all(
    entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith('backup-'))
      .map(async (entry): Promise<BackupEntry | null> => {
        try {
          const stats = await fs.stat(path.join(BACKUPS_DIR, entry.name));
          return { name: entry.name, time: stats.mtime.getTime() };
        } catch (statError) {
          // Fallback to parsing date from name if stat fails
          console.warn(`[Backup Utils] Stat failed for ${entry.name}, falling back to name parsing: ${statError}`);
          const name = entry.name; // e.g., backup-YYYY-MM-DD-HHMMSS
          if (name.length === 26 && name.startsWith('backup-')) { // Basic check for format
            try {
              const year = parseInt(name.substring(7, 11));
              const month = parseInt(name.substring(12, 14)) - 1; // Month is 0-indexed
              const day = parseInt(name.substring(15, 17));
              const hour = parseInt(name.substring(18, 20));
              const minute = parseInt(name.substring(20, 22));
              const second = parseInt(name.substring(22, 24));
              if (![year, month, day, hour, minute, second].some(isNaN)) {
                return { name: entry.name, time: new Date(year, month, day, hour, minute, second).getTime() };
              }
            } catch (parseError) {
              console.error(`[Backup Utils] Error parsing date from backup directory name ${entry.name}:`, parseError);
            }
          }
          // If name parsing also fails or format is wrong, assign a time that makes it likely to be kept or handled as an anomaly
          console.warn(`[Backup Utils] Could not determine date for ${entry.name}, assigning current time to avoid deletion unless necessary.`);
          return { name: entry.name, time: Date.now() }; // Or 0 to prioritize deletion if that's preferred for unknowns
        }
      })
  )).filter(entry => entry !== null) as BackupEntry[];


  // Sort by time, oldest first
  const sortedBackupDirs = backupDirsWithTime.sort((a, b) => a.time - b.time);

  if (sortedBackupDirs.length >= MAX_BACKUPS) {
    const backupsToDeleteCount = sortedBackupDirs.length - (MAX_BACKUPS - 1);
    for (let i = 0; i < backupsToDeleteCount; i++) {
      const dirToDeletePath = path.join(BACKUPS_DIR, sortedBackupDirs[i].name);
      try {
        await fs.rm(dirToDeletePath, { recursive: true, force: true });
        console.log(`[Backup Utils] Deleted old backup directory: ${sortedBackupDirs[i].name}`);
      } catch (delError) {
        console.error(`[Backup Utils] Error deleting old backup directory ${sortedBackupDirs[i].name}:`, delError);
      }
    }
  }
}
