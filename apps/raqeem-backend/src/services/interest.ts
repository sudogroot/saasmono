import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'
import { interestRequest } from '../db/schema/interest'
import type { CreateInterestRequest } from '../types/interest'

type Database =
  | PgTransaction<
      NodePgQueryResultHKT,
      Record<string, never>,
      ExtractTablesWithRelations<Record<string, never>>
    >
  | Parameters<typeof import('../db/index').db.query.user.findFirst>[0]['db']

export const createInterestService = (db: Database) => {
  return {
    async createInterestRequest(data: CreateInterestRequest) {
      const [request] = await db
        .insert(interestRequest)
        .values({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          wantsDemo: data.wantsDemo,
          notes: data.notes,
        })
        .returning()

      return request
    },

    async getInterestRequestById(id: string) {
      const request = await db.query.interestRequest.findFirst({
        where: eq(interestRequest.id, id),
      })

      return request
    },

    async getAllInterestRequests() {
      const requests = await db.query.interestRequest.findMany({
        orderBy: (interestRequest, { desc }) => [desc(interestRequest.createdAt)],
      })

      return requests
    },
  }
}
