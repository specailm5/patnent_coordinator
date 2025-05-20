// server/plugins/scheduler-initializer.ts
import backupScheduler from '../tasks/scheduler';

// Nitro plugins are automatically discovered and registered.
// defineNitroPlugin is available globally in this context.
export default defineNitroPlugin((nitroApp) => {
  // Start scheduled tasks
  backupScheduler(); 
  console.log('Nitro plugin: Backup scheduler started.');
});
