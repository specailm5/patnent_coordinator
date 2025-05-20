import { defineEventHandler, readBody } from 'h3';
import db from '../../database/schema';
import { TrackingSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) throw new Error('ID is required');
  const method = event.req.method;
  if (method === 'GET') {
    const r = db.prepare('SELECT * FROM tracking WHERE id = ?').get(id) as Record<string, any>;
    if (!r) return { statusCode: 404, message: 'Tracking not found' };
    
    return {
      ...r,
      staff_ids: r.staff_ids ? JSON.parse(r.staff_ids) : [],
      staff_titles: r.staff_titles ? JSON.parse(r.staff_titles) : [],
      // Include contract_status from DB
      contract_status: r.contract_status
    };
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    const data = TrackingSchema.parse(body);
    
    // Get patient name before update
    const patient = db.prepare('SELECT name FROM patients WHERE id = ?').get(data.patient_id) as { name: string };

    db.prepare(
      `UPDATE tracking SET
        patient_id = ?, contact_person = ?, location = ?, from_date = ?, to_date = ?,
        staff_ids = ?, staff_titles = ?, hours_per_day = ?, days_per_week = ?,
        duration_days = ?, timing = ?, amount = ?, holiday_amount = ?, total = ?,
        paid = ?, contract_sent = ?, contract_signed = ?, status = ?,
        coordinator_id = ?, contract_status = ? WHERE id = ?`
      ).run(
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
        data.contract_status,
        id
    );
    // Log activity with patient name
    const patientName = patient ? patient.name : `ID: ${data.patient_id}`;
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('tracking', 'edit', id, `Edited tracking for patient ${patientName} (Tracking ID: ${id})`, new Date().toISOString());
    return { success: true };
  }

  if (method === 'DELETE') {
    db.prepare('DELETE FROM tracking WHERE id = ?').run(id);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('tracking', 'delete', id, `Deleted tracking with ID: ${id}`, new Date().toISOString());
    return { success: true };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
