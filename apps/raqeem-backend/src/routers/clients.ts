import { z } from 'zod'
import { db } from '../db/index'
import { OrpcErrorHelper, getCurrentUserId, getOrgId } from '../lib/errors/orpc-errors'
import { protectedProcedure } from '../lib/orpc'
import { createClientService } from '../services/clients'
import {
  CreateClientSchema,
  UpdateClientSchema,
  ClientSchema,
  ClientListItemSchema,
  SuccessResponseSchema,
} from '../types/client'

const clientService = createClientService(db)

export const clientRouter = {
  createClient: protectedProcedure
    .input(CreateClientSchema)
    .output(ClientSchema)
    .route({
      method: 'POST',
      path: '/clients',
      tags: ['Clients'],
      summary: 'Create client',
      description: 'Creates a new client',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await clientService.createClient(orgId, userId, input)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to create client')
      }
    }),

  getClientById: protectedProcedure
    .input(
      z.object({
        clientId: z.string().min(1).describe('Client ID'),
      })
    )
    .output(ClientSchema)
    .route({
      method: 'GET',
      path: '/clients/{clientId}',
      tags: ['Clients'],
      summary: 'Get client by ID',
      description: 'Retrieves a client by ID',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      try {
        return await clientService.getClientById(input.clientId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch client')
      }
    }),

  updateClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string().min(1).describe('Client ID'),
      }).merge(UpdateClientSchema)
    )
    .output(ClientSchema)
    .route({
      method: 'PUT',
      path: '/clients/{clientId}',
      tags: ['Clients'],
      summary: 'Update client',
      description: 'Updates client information',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      const { clientId, ...updateData } = input
      try {
        return await clientService.updateClient(clientId, orgId, userId, updateData)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to update client')
      }
    }),

  deleteClient: protectedProcedure
    .input(
      z.object({
        clientId: z.string().min(1).describe('Client ID'),
      })
    )
    .output(SuccessResponseSchema)
    .route({
      method: 'DELETE',
      path: '/clients/{clientId}',
      tags: ['Clients'],
      summary: 'Delete client',
      description: 'Soft deletes a client',
    })
    .handler(async ({ input, context }) => {
      const orgId = getOrgId(context)
      const userId = getCurrentUserId(context)
      try {
        return await clientService.deleteClient(input.clientId, orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to delete client')
      }
    }),

  listClients: protectedProcedure
    .output(z.array(ClientListItemSchema))
    .route({
      method: 'GET',
      path: '/clients',
      tags: ['Clients'],
      summary: 'List clients',
      description: 'Retrieves all clients for the organization',
    })
    .handler(async ({ context }) => {
      const orgId = getOrgId(context)
      try {
        return await clientService.listClients(orgId)
      } catch (error) {
        throw OrpcErrorHelper.handleServiceError(error, 'Failed to fetch clients')
      }
    }),
}