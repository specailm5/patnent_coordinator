// Import without top-level await
import fs from 'fs/promises';
import path from 'path';
import { 
  ensureBackupsDir, 
  manageOldBackups, 
  getFormattedDate,
  SOURCE_DATA_DIR,
  DB_FILES_TO_BACKUP,
  BACKUPS_DIR
} from '../utils/backupUtils';

// We'll initialize cron conditionally inside the function
let cron: any = null;

const sourceDbConfigs = DB_FILES_TO_BACKUP.map(file => ({
  name: file,
  path: path.join(SOURCE_DATA_DIR, file)
}));

async function createScheduledBackup() {
  console.log('[Scheduler] Starting scheduled backup process...');
  await ensureBackupsDir();
  await manageOldBackups();

  const timestamp = getFormattedDate(new Date());
  const backupDirName = `backup-${timestamp}`;
  const currentBackupPath = path.join(BACKUPS_DIR, backupDirName);

  try {
    await fs.mkdir(currentBackupPath, { recursive: true });
    let allFilesBackedUp = true;

    for (const dbConfig of sourceDbConfigs) {
      try {
        await fs.access(dbConfig.path);
        const destPath = path.join(currentBackupPath, dbConfig.name);
        await fs.copyFile(dbConfig.path, destPath);
        console.log(`[Scheduler] Copied ${dbConfig.name} to ${destPath}`);
      } catch (dbAccessError: any) {
        allFilesBackedUp = false;
        console.error(`[Scheduler] Error accessing or copying database file ${dbConfig.name} from ${dbConfig.path}: ${dbAccessError.message}`);
      }
    }

    if (allFilesBackedUp) {
      console.log(`[Scheduler] Scheduled backup created successfully in directory: ${backupDirName}`);
    } else {
      console.warn(`[Scheduler] Scheduled backup in directory ${backupDirName} completed with one or more errors.`);
    }

  } catch (error: any) {
    console.error('[Scheduler] Critical error creating scheduled backup directory or processing files:', error.message);
  }
}

export default () => {
  // Try to import node-cron if in development
  try {
    // Only require node-cron in development mode
    if (process.env.NODE_ENV !== 'production') {
      cron = require('node-cron');
    }
  } catch (e) {
    console.warn('[Scheduler] node-cron import failed, using fallback scheduler');
    cron = null;
  }
  
  // Check if node-cron is available
  if (cron) {
    // Use node-cron in development
    cron.schedule('0 0 16 * * *', () => {
      console.log('[Scheduler] Running daily backup job at 4:00 PM (Asia/Riyadh)...');
      createScheduledBackup();
    }, {
      timezone: "Asia/Riyadh"
    });
    console.log('[Scheduler] Daily backup job scheduled for 4:00 PM (Asia/Riyadh) using node-cron.');
  } else {
    // Simple fallback scheduler for production
    console.log('[Scheduler] Using simple scheduler for production');
    
    // Calculate time to next 4:00 PM in Asia/Riyadh
    const calculateTimeToNextRun = () => {
      // Create a date object for the current time
      const now = new Date();
      
      // Create a date object for today at 4:00 PM
      // Note: This is a simplification and doesn't properly handle timezone
      const targetHour = 16; // 4:00 PM
      const targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        targetHour,
        0,
        0
      );
      
      // If it's already past 4 PM, set for tomorrow
      if (now > targetDate) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      // Return milliseconds until the target time
      return targetDate.getTime() - now.getTime();
    };
    
    const scheduleNextRun = () => {
      const msToNextRun = calculateTimeToNextRun();
      console.log(`[Scheduler] Next backup scheduled in ${Math.floor(msToNextRun / 1000 / 60 / 60)} hours and ${Math.floor((msToNextRun / 1000 / 60) % 60)} minutes`);
      
      setTimeout(() => {
        console.log('[Scheduler] Running daily backup job...');
        createScheduledBackup();
        scheduleNextRun(); // Schedule next run after completing this one
      }, msToNextRun);
    };
    
    // Start scheduling
    scheduleNextRun();
  }
};
