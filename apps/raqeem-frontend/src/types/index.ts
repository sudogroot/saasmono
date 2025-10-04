// Re-export types inferred from ORPC backend router
import type { AppRouter } from '../../../raqeem-backend/src/routers/index'
import type { InferRouterOutputs, InferRouterInputs } from '@orpc/server'

// Infer all output types from the ORPC router
type RouterOutputs = InferRouterOutputs<AppRouter>
type RouterInputs = InferRouterInputs<AppRouter>

// Case types
export type Case = RouterOutputs['cases']['createCase']
export type CaseWithRelations = RouterOutputs['cases']['getCaseById']
export type CaseListItem = RouterOutputs['cases']['listCases'][number]
export type CreateCaseInput = RouterInputs['cases']['createCase']
export type UpdateCaseInput = RouterInputs['cases']['updateCase']

// Client types
export type Client = RouterOutputs['clients']['createClient']
export type DetailedClient = RouterOutputs['clients']['getClientById']
export type ClientListItem = RouterOutputs['clients']['listClients'][number]
export type ClientDropdownItem = RouterOutputs['clients']['getClientsForDropdown'][number]
export type CreateClientInput = RouterInputs['clients']['createClient']
export type UpdateClientInput = RouterInputs['clients']['updateClient']

// Opponent types
export type Opponent = RouterOutputs['opponents']['createOpponent']
export type OpponentListItem = RouterOutputs['opponents']['listOpponents'][number]
export type OpponentDropdownItem = RouterOutputs['opponents']['getOpponentsForDropdown'][number]
export type CreateOpponentInput = RouterInputs['opponents']['createOpponent']
export type UpdateOpponentInput = RouterInputs['opponents']['updateOpponent']

// Court types
export type Court = RouterOutputs['courts']['createCourt']
export type CourtListItem = RouterOutputs['courts']['listCourts'][number]

// Trial types
export type Trial = RouterOutputs['trials']['createTrial']
export type TrialWithRelations = RouterOutputs['trials']['getTrialById']
export type TrialListItem = RouterOutputs['trials']['listTrials'][number]
export type CreateTrialInput = RouterInputs['trials']['createTrial']
export type UpdateTrialInput = RouterInputs['trials']['updateTrial']

// Enum types - re-export from backend for convenience
export type { CaseStatus, Priority } from '../../../raqeem-backend/src/types/case'
export type { ClientType } from '../../../raqeem-backend/src/types/client'
export type { OpponentType } from '../../../raqeem-backend/src/types/opponent'
