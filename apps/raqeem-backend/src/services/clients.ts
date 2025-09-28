import { and, eq, isNull, inArray } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { member } from '../db/schema/auth'
import { clients } from '../db/schema/clients'
import { cases } from '../db/schema/cases'
import { trials } from '../db/schema/trials'
import { courts } from '../db/schema/courts'
import type { ClientListItem, ClientResponse, CreateClientInput, UpdateClientInput } from '../types/client'

export class ClientService {
  private db: NodePgDatabase

  constructor(db: NodePgDatabase) {
    this.db = db
  }

  async createClient(orgId: string, userId: string, data: CreateClientInput): Promise<ClientResponse> {
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
  }

  async getClientById(clientId: string, orgId: string): Promise<ClientResponse> {
    const result = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    if (result.length === 0) {
      throw new Error('Client not found')
    }

    return result[0] as ClientResponse
  }

  async updateClient(
    clientId: string,
    orgId: string,
    userId: string,
    data: UpdateClientInput
  ): Promise<ClientResponse> {
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
  }

  async deleteClient(clientId: string, orgId: string): Promise<{ success: boolean }> {
    // Verify client exists and belongs to organization
    const existingClient = await this.db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId), isNull(clients.deletedAt)))

    if (existingClient.length === 0) {
      throw new Error('Client not found')
    }

    // Soft delete
    await this.db
      .update(clients)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(clients.id, clientId))

    return { success: true }
  }

  async listClients(orgId: string, includeDeleted?: boolean): Promise<ClientListItem[]> {
    const whereConditions = [eq(clients.organizationId, orgId)]

    if (!includeDeleted) {
      whereConditions.push(isNull(clients.deletedAt))
    }

    // Get clients first
    const clientsResult = await this.db
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

    // Get cases for all clients with their trials
    const clientIds = clientsResult.map(client => client.id)

    if (clientIds.length === 0) {
      return []
    }

    // Get cases with trials for these clients
    const casesWithTrials = await this.db
      .select({
        caseId: cases.id,
        clientId: cases.clientId,
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
        eq(cases.organizationId, orgId),
        isNull(cases.deletedAt),
        inArray(cases.clientId, clientIds)
      ))

    // Group cases by client and trials by case
    const clientCasesMap = new Map<string, any[]>()

    for (const row of casesWithTrials) {
      if (!clientCasesMap.has(row.clientId)) {
        clientCasesMap.set(row.clientId, [])
      }

      const clientCases = clientCasesMap.get(row.clientId)!
      let existingCase = clientCases.find(c => c.id === row.caseId)

      if (!existingCase) {
        existingCase = {
          id: row.caseId,
          caseNumber: row.caseNumber,
          caseTitle: row.caseTitle,
          courtFileNumber: row.courtFileNumber,
          caseSubject: row.caseSubject,
          caseStatus: row.caseStatus,
          priority: row.priority,
          trial: []
        }
        clientCases.push(existingCase)
      }

      if (row.trialId) {
        existingCase.trial.push({
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

    // Combine clients with their cases
    return clientsResult.map(client => ({
      ...client,
      case: clientCasesMap.get(client.id) || []
    })) as ClientListItem[]
  }
}

export function createClientService(db: NodePgDatabase) {
  return new ClientService(db)
}
