import { defineEventHandler, getQuery } from 'h3';
import archiveDb from '../../database/archive_schema';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const year = query.year ? parseInt(query.year as string, 10) : null;

  try {
    if (year) {
      // Fetch months for a given year
      // Ensure from_date is stored in a way that allows easy extraction, e.g., YYYY-MM-DD
      const stmt = archiveDb.prepare(`
        SELECT DISTINCT CAST(strftime('%m', from_date) AS INTEGER) as month
        FROM archive_tracking
        WHERE strftime('%Y', from_date) = ?
        ORDER BY month ASC
      `);
      const results = stmt.all(year.toString()) as { month: number }[];
      return { months: results.map(r => r.month) };
    } else {
      // Fetch all available years
      const stmt = archiveDb.prepare(`
        SELECT DISTINCT CAST(strftime('%Y', from_date) AS INTEGER) as year
        FROM archive_tracking
        ORDER BY year DESC
      `);
      const results = stmt.all() as { year: number }[];
      return { years: results.map(r => r.year) };
    }
  } catch (e: any) {
    console.error('Error fetching available archive dates:', e);
    event.node.res.statusCode = 500;
    return { error: 'Failed to fetch available archive dates', message: e.message };
  }
});
