import { defineEventHandler, createError } from 'h3'
import db from '~/server/database/schema'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)

  // @ts-expect-error session user type
  const userRole = (session?.user as { role?: string })?.role

  // Only Admins and Managers can fetch all roles for now
  // This can be adjusted if other roles need access to the list of roles
  if (!session || !session.user || !userRole || !['Admin', 'Manager'].includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden. You do not have permission to access this resource.',
    })
  }

  const method = event.req.method

  if (method === 'GET') {
    try {
      const roles = db.prepare('SELECT id, name FROM roles').all()
      return roles
    } catch (error: any) {
      console.error('Error fetching roles:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch roles.',
        data: error.message,
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method Not Allowed. Only GET is supported for this endpoint.',
  })
})
