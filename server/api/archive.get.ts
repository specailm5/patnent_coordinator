// filepath: server/api/archive.get.ts
import { defineEventHandler } from 'h3'
import archiveDb from '../database/archive_schema'

export default defineEventHandler(async (event) => {
  try {
    // Get total archived records
    const countStmt = archiveDb.prepare('SELECT COUNT(*) as count FROM archive_tracking')
    const countRow = countStmt.get() as { count: number }

    // Get the latest archived_at timestamp
    const dateStmt = archiveDb.prepare('SELECT MAX(archived_at) as lastDate FROM archive_tracking')
    const dateRow = dateStmt.get() as { lastDate: string | null }

    return {
      count: countRow.count,
      lastDate: dateRow.lastDate || null
    }
  } catch (error: any) {
    console.error('Error fetching archive summary:', error)
    event.node.res.statusCode = 500
    return { error: 'Failed to fetch archive summary', message: error.message }
  }
})
