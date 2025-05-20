import { defineEventHandler, readBody } from 'h3';
import db from '../database/schema'; // Main database connection
import archiveDb from '../database/archive_schema'; // Archive database connection

export default defineEventHandler(async (event) => {
  // Start transactions
  const mainDbTransaction = db.transaction(() => {
    const trackings = db.prepare(`
      SELECT t.*, p.name as patient_name, p.isBaby
      FROM tracking t
      LEFT JOIN patients p ON t.patient_id = p.id
    `).all() as any[];

    if (trackings.length === 0) {
      return { archived: 0, details: [] };
    }
    
    const archiveStmt = archiveDb.prepare(`
      INSERT INTO archive_tracking (
        original_tracking_id, patient_id, patient_name, contact_person, location, isBaby,
        from_date, to_date, staff_ids, staff_titles, hours_per_day, days_per_week, 
        duration_days, timing, amount, holiday_amount, total, paid, 
        contract_sent, contract_signed, status, coordinator_id, contract_status, archived_at
      ) VALUES (
        @original_tracking_id, @patient_id, @patient_name, @contact_person, @location, @isBaby,
        @from_date, @to_date, @staff_ids, @staff_titles, @hours_per_day, @days_per_week, 
        @duration_days, @timing, @amount, @holiday_amount, @total, @paid, 
        @contract_sent, @contract_signed, @status, @coordinator_id, @contract_status, @archived_at
      )
    `);

    const archivedIds: number[] = [];

    archiveDb.transaction(() => {
      for (const tracking of trackings) {
        archiveStmt.run({
          original_tracking_id: tracking.id,
          patient_id: tracking.patient_id,
          patient_name: tracking.patient_name, // Populated from the JOIN
          contact_person: tracking.contact_person,
          location: tracking.location,
          isBaby: tracking.isBaby,
          from_date: tracking.from_date,
          to_date: tracking.to_date,
          staff_ids: tracking.staff_ids, // Assumed to be JSON string or compatible TEXT
          staff_titles: tracking.staff_titles, // Assumed to be TEXT
          hours_per_day: tracking.hours_per_day,
          days_per_week: tracking.days_per_week,
          duration_days: tracking.duration_days,
          timing: tracking.timing,
          amount: tracking.amount,
          holiday_amount: tracking.holiday_amount,
          total: tracking.total,
          paid: tracking.paid, // Stored as INTEGER (0 or 1) in db
          contract_sent: tracking.contract_sent, // Stored as INTEGER (0, 1, or NULL)
          contract_signed: tracking.contract_signed, // Stored as INTEGER (0 or 1)
          status: tracking.status,
          coordinator_id: tracking.coordinator_id,
          contract_status: tracking.contract_status,
          archived_at: new Date().toISOString()
        });
        archivedIds.push(tracking.id);
      }
    })();

    if (archivedIds.length > 0) {
      // All records successfully inserted into archive, now delete from main tracking table
      const deleteStmt = db.prepare('DELETE FROM tracking'); // Deletes all records
      deleteStmt.run();
    }
    return { archived: archivedIds.length };
  });

  try {
    const result = mainDbTransaction();
    return result;
  } catch (error: any) {
    console.error('Archiving failed:', error);
    event.node.res.statusCode = 500;
    return { error: 'Failed to archive records', message: error.message };
  }
});
