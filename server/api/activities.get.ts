import { defineEventHandler, getQuery } from 'h3';
import db from '../database/schema';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10;
  const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

  const rows = db.prepare(`
    SELECT * FROM activities
    ORDER BY date DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  return rows;
});