import { defineEventHandler } from 'h3';
import archiveDb from '../../../../database/archive_schema';

// Define the expected structure of an archived tracking record for type safety
interface ArchivedTracking {
  archive_id: number;
  original_tracking_id: number;
  patient_id: number;
  patient_name?: string; 
  contact_person: string;
  location?: string;
  isBaby?: number;
  from_date: string;
  to_date: string;
  staff_ids?: string; // JSON string of numbers
  staff_titles?: string;
  hours_per_day: number;
  days_per_week: number;
  duration_days: number;
  timing: string;
  amount: number;
  holiday_amount: number;
  total: number;
  paid: number; // 0 or 1
  contract_sent?: number | null; // 0, 1, or NULL
  contract_signed: number; // 0 or 1
  status: string;
  coordinator_id?: number;
  contract_status?: string;
  archived_at: string; // ISO 8601 date string
}

export default defineEventHandler((event) => {
  const year = event.context.params?.year;
  const month = event.context.params?.month;

  if (!year || !month) {
    event.node.res.statusCode = 400;
    return { error: 'Year and month parameters are required.' };
  }

  // Ensure month is two digits (e.g., '01', '05', '12') for strftime matching
  const formattedMonth = month.padStart(2, '0');

  try {
    const stmt = archiveDb.prepare(`      SELECT 
        archive_id,
        original_tracking_id,
        patient_id,
        patient_name,
        contact_person,
        location,
        isBaby,
        from_date,
        to_date,
        staff_ids,
        staff_titles,
        hours_per_day,
        days_per_week,
        duration_days,
        timing,
        amount,
        holiday_amount,
        total,
        paid,
        contract_sent,
        contract_signed,
        status,
        coordinator_id,
        contract_status,
        archived_at
      FROM archive_tracking
      WHERE strftime('%Y', from_date) = ? AND strftime('%m', from_date) = ?
      ORDER BY from_date ASC, original_tracking_id ASC
    `);
    
    const results = stmt.all(year, formattedMonth) as ArchivedTracking[];
    
    // Convert staff_ids from JSON string to array of numbers for consistency with frontend expectations
    return results.map(tracking => ({
      ...tracking,
      staff_ids: tracking.staff_ids ? JSON.parse(tracking.staff_ids) : [],
      // Booleans are handled as 0/1 from DB, frontend can adapt or convert if needed
    }));

  } catch (e: any) {
    console.error(`Error fetching archived entries for ${year}-${formattedMonth}:`, e);
    event.node.res.statusCode = 500;
    return { error: 'Failed to fetch archived entries', message: e.message };
  }
});
