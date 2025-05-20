import { defineEventHandler, readBody, createError } from 'h3';
import db from '../../database/schema';
import { TrackingSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  if (method === 'GET') {
    try {
      const rows = db.prepare(`
        SELECT t.*, p.name as patient_name 
        FROM tracking t
        LEFT JOIN patients p ON t.patient_id = p.id
      `).all() as any[];
      return rows.map(r => ({
        ...r,
        staff_ids: r.staff_ids ? JSON.parse(r.staff_ids) : [],
        staff_titles: r.staff_titles ? JSON.parse(r.staff_titles) : [],
        // Preserve contract_status from DB directly
        contract_status: r.contract_status
      }));
    } catch (error) {
      console.error('Error fetching tracking records:', error);
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch tracking records'
      });
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event);
      console.log('Received tracking body:', body);

      // Validate the data
      const data = TrackingSchema.parse(body);
      console.log('Parsed tracking data:', data);

      // Prepare the statement and execute
      const stmt = db.prepare(`
        INSERT INTO tracking (
          patient_id, contact_person, location, from_date, to_date,
          staff_ids, staff_titles, hours_per_day, days_per_week,
          duration_days, timing, amount, holiday_amount, total,
          paid, contract_sent, contract_signed, status,
          coordinator_id, contract_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        data.patient_id,
        data.contact_person,
        data.location,
        data.from_date,
        data.to_date,
        JSON.stringify(data.staff_ids || []),
        JSON.stringify(data.staff_titles || []),
        data.hours_per_day,
        data.days_per_week,
        data.duration_days,
        data.timing,
        data.amount,
        data.holiday_amount,
        data.total,
        data.paid ? 1 : 0,
        data.contract_sent == null ? null : data.contract_sent ? 1 : 0,
        data.contract_signed ? 1 : 0,
        data.status,
        data.coordinator_id,
        data.contract_status
      );
      // Log activity
      // Fetch patient name for logging
      const patient = db.prepare('SELECT name FROM patients WHERE id = ?').get(data.patient_id) as { name: string } | undefined;
      const patientName = patient ? patient.name : `ID: ${data.patient_id}`;

      db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
        .run('tracking', 'add', info.lastInsertRowid, `Added tracking for patient: ${patientName}`, new Date().toISOString());
      return { id: info.lastInsertRowid };
    } catch (error) {
      console.error('Error creating tracking record:', error);
      throw createError({
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to create tracking record'
      });
    }
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
