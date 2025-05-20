import { defineEventHandler } from 'h3';
import { readBody } from 'h3';
import db from '../../database/schema';
import { PatientSchema } from '../../database/validation';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) throw new Error('ID is required');
  const method = event.req.method;

  if (method === 'GET') {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    return patient;
  }
  if (method === 'PUT') {
    const body = await readBody(event);
    const data = PatientSchema.parse(body);
    db.prepare(
      'UPDATE patients SET name = ?, person = ?, contact = ?, location = ?, isBaby = ? WHERE id = ?'
    ).run(data.name, data.person, data.contact, data.location, data.isBaby ? 1 : 0, id);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('patients', 'edit', id, `Edited patient: ${data.name}`, new Date().toISOString());
    return { success: true };
  }

  if (method === 'DELETE') {
    // Check for referencing tracking records
    interface CountResult { cnt: number }
    const referencing = db.prepare('SELECT COUNT(*) as cnt FROM tracking WHERE patient_id = ?').get(id) as CountResult;
    if (referencing && referencing.cnt > 0) {
      return { success: false, error: 'Cannot delete patient: There are tracking records referencing this patient. Please delete or reassign those records first.' };
    }
    db.prepare('DELETE FROM patients WHERE id = ?').run(id);
    // Log activity
    db.prepare('INSERT INTO activities (type, action, entity_id, message, date) VALUES (?, ?, ?, ?, ?)')
      .run('patients', 'delete', id, `Deleted patient with ID: ${id}`, new Date().toISOString());
    return { success: true };
  }

  return { statusCode: 405, message: 'Method Not Allowed' };
});
