import { and, eq, isNull, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { clients } from '../db/schema/clients'
import { cases } from '../db/schema/cases'
import { trials } from '../db/schema/trials'
import { courts } from '../db/schema/courts'
import type { ClientDropdownItem, ClientListItem, ClientResponse, CreateClientInput, UpdateClientInput, DetailedClientResponse } from '../types/client'

export class ClientService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createClient(orgId: string, userId: string, data: CreateClientInput): Promise<ClientResponse> {
    try {
      // Verify user belongs to organization
      const usermemberhip = await this.db
        .select()
        .from(member)
        .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))

      if (usermemberhip.length === 0) {
        throw new Error('User not found in organization')
      }

      const [newClient] = await this.db
        .insert(clients)
        .values({
          ...data,
          organizationId: orgId,
          createdBy: userId,
        })
        .returning()

      if (!newClient) {
        throw new Error('Failed to create client')
      }

      return newClient as ClientResponse
    } catch (error) {
      console.error('[CLIENT SERVICE] Create client error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to create client')
    }
  }

  async getClientById(clientId: string, orgId: string): Promise<DetailedClientResponse> {
    try {
      // Get client data
      const clientResult = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    if (clientResult.length === 0) {
      throw new Error('Client not found')
    }

    const client = clientResult[0]

    // Get cases with trials for this client
    const casesWithTrials = await this.db
      .select({
        caseId: cases.id,
        caseNumber: cases.caseNumber,
        caseTitle: cases.caseTitle,
        courtFileNumber: cases.courtFileNumber,
        caseSubject: cases.caseSubject,
        caseStatus: cases.caseStatus,
        priority: cases.priority,
        trialId: trials.id,
        trialNumber: trials.trialNumber,
        trialDateTime: trials.trialDateTime,
        courtId: trials.courtId,
        courtName: courts.name,
      })
      .from(cases)
      .leftJoin(trials, and(eq(trials.caseId, cases.id), isNull(trials.deletedAt)))
      .leftJoin(courts, eq(courts.id, trials.courtId))
      .where(and(
        eq(cases.clientId, clientId),
        eq(cases.organizationId, orgId),
        isNull(cases.deletedAt)
      ))

    // Group trials by case
    const casesMap = new Map<string, any>()

    for (const row of casesWithTrials) {
      if (!casesMap.has(row.caseId)) {
        casesMap.set(row.caseId, {
          id: row.caseId,
          caseNumber: row.caseNumber,
          caseTitle: row.caseTitle,
          courtFileNumber: row.courtFileNumber,
          caseSubject: row.caseSubject,
          caseStatus: row.caseStatus,
          priority: row.priority,
          trial: []
        })
      }

      const caseData = casesMap.get(row.caseId)!

      if (row.trialId) {
        caseData.trial.push({
          id: row.trialId,
          trialNumber: row.trialNumber,
          court: row.courtName ? {
            name: row.courtName,
            id: row.courtId
          } : null,
          trialDateTime: row.trialDateTime
        })
      }
    }

      return {
        ...client,
        case: Array.from(casesMap.values())
      } as DetailedClientResponse
    } catch (error) {
      console.error('[CLIENT SERVICE] Get client by ID error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to fetch client')
    }
  }

  async updateClient(
    clientId: string,
    orgId: string,
    userId: string,
    data: UpdateClientInput
  ): Promise<ClientResponse> {
    try {
      // Verify client exists and belongs to organization
      const existingClient = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    if (existingClient.length === 0) {
      throw new Error('Client not found')
    }

    const [updatedClient] = await this.db
      .update(clients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning()

      if (!updatedClient) {
        throw new Error('Failed to update client')
      }

      return updatedClient as ClientResponse
    } catch (error) {
      console.error('[CLIENT SERVICE] Update client error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to update client')
    }
  }

  async deleteClient(clientId: string, orgId: string, userId: string): Promise<{ success: boolean }> {
    try {
    // Verify client exists and belongs to organization
    const existingClient = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    if (existingClient.length === 0) {
      throw new Error('Client not found')
    }

      const now = new Date()

      // Cascading soft delete: First, soft delete all trials for cases belonging to this client
      const clientCases = await this.db
        .select({ id: cases.id })
        .from(cases)
        .where(and(eq(cases.clientId, clientId), isNull(cases.deletedAt)))

      if (clientCases.length > 0) {
        const caseIds = clientCases.map(c => c.id)

        // Soft delete all trials for these cases
        await this.db
          .update(trials)
          .set({
            deletedBy: userId,
            deletedAt: now,
          })
          .where(and(
            inArray(trials.caseId, caseIds),
            isNull(trials.deletedAt)
          ))

        // Soft delete all cases for this client
        await this.db
          .update(cases)
          .set({
            deletedBy: userId,
            deletedAt: now,
          })
          .where(and(eq(cases.clientId, clientId), isNull(cases.deletedAt)))
      }

      // Finally, soft delete the client
      await this.db
        .update(clients)
        .set({
          deletedAt: now,
        })
        .where(eq(clients.id, clientId))

      return { success: true }
    } catch (error) {
      console.error('[CLIENT SERVICE] Delete client error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to delete client')
    }
  }

  async getClientDeletionImpact(clientId: string, orgId: string): Promise<{
    casesCount: number
    trialsCount: number
    cases: Array<{ id: string; caseNumber: string; caseTitle: string; trialsCount: number }>
  }> {
    try {
      // Verify client exists
      const existingClient = await this.db
        .select()
        .from(clients)
        .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

      if (existingClient.length === 0) {
        throw new Error('Client not found')
      }

      // Get all cases and their trials
      const casesWithTrials = await this.db
        .select({
          caseId: cases.id,
          caseNumber: cases.caseNumber,
          caseTitle: cases.caseTitle,
          trialId: trials.id,
        })
        .from(cases)
        .leftJoin(trials, and(eq(trials.caseId, cases.id), isNull(trials.deletedAt)))
        .where(and(eq(cases.clientId, clientId), isNull(cases.deletedAt)))

      // Group by case
      const casesMap = new Map<string, { id: string; caseNumber: string; caseTitle: string; trialsCount: number }>()
      let totalTrials = 0

      for (const row of casesWithTrials) {
        if (!casesMap.has(row.caseId)) {
          casesMap.set(row.caseId, {
            id: row.caseId,
            caseNumber: row.caseNumber,
            caseTitle: row.caseTitle,
            trialsCount: 0,
          })
        }

        if (row.trialId) {
          const caseData = casesMap.get(row.caseId)!
          caseData.trialsCount++
          totalTrials++
        }
      }

      return {
        casesCount: casesMap.size,
        trialsCount: totalTrials,
        cases: Array.from(casesMap.values()),
      }
    } catch (error) {
      console.error('[CLIENT SERVICE] Get deletion impact error:', error)
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error('Failed to get deletion impact')
    }
  }

  async listClients(orgId: string, includeDeleted?: boolean): Promise<ClientListItem[]> {
    try {
    const whereConditions = [eq(clients.organizationId, orgId)]

    if (!includeDeleted) {
      whereConditions.push(isNull(clients.deletedAt))
    }

    const result = await this.db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        clientType: clients.clientType,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
        .where(and(...whereConditions))
        .orderBy(clients.createdAt)

      return result as ClientListItem[]
    } catch (error) {
      console.error('[CLIENT SERVICE] List clients error:', error)
      throw new Error('Failed to fetch clients')
    }
  }

  async getClientsForDropdown(orgId: string): Promise<ClientDropdownItem[]> {
    try {
    const result = await this.db
      .select({
        id: clients.id,
        name: clients.name,
        clientType: clients.clientType,
      })
      .from(clients)
        .where(and(eq(clients.organizationId, orgId), isNull(clients.deletedAt)))
        .orderBy(clients.name)

      return result as ClientDropdownItem[]
    } catch (error) {
      console.error('[CLIENT SERVICE] Get clients for dropdown error:', error)
      throw new Error('Failed to fetch clients for dropdown')
    }
  }
}

export function createClientService(db: NodePgDatabase) {
  return new ClientService(db)
}
