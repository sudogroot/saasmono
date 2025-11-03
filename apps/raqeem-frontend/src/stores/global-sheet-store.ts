import type { ReactNode } from 'react'
import { create } from 'zustand'

// =============================================================================
// URL PARAMETER UTILITIES
// =============================================================================

/**
 * Updates URL parameters without causing page refresh
 * Used to sync sheet state with browser URL for bookmarking/sharing
 */
const updateUrlParams = (params: Record<string, string | null>) => {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  const searchParams = new URLSearchParams(url.search)

  // Add or remove parameters based on value
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key)
    } else {
      searchParams.set(key, value)
    }
  })

  const newUrl = `${url.pathname}?${searchParams.toString()}`
  window.history.replaceState({}, '', newUrl)
}

/**
 * Extracts all URL parameters as key-value pairs
 */
const getUrlParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}

  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(window.location.search)

  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }

  return params
}

// =============================================================================
// SHEET DATA TYPES
// =============================================================================

export interface GlobalSheetData {
  id: string
  title: string
  component: string
  props?: Record<string, any>
  controlled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  onClose?: () => void
  urlParams?: Record<string, string>
  footer?: {
    type?: 'form' | 'custom' | 'none'
    actions?: {
      onSubmit?: () => void
      onCancel?: () => void
      submitLabel?: string
      isLoading?: boolean
      formRef?: any
      canGoNext?: boolean
      canGoPrevious?: boolean
      onNext?: () => void
      onPrevious?: () => void
      currentStep?: number
      totalSteps?: number
      errorMessage?: string
    }
  }
}

interface GlobalSheetState {
  sheetStack: GlobalSheetData[]
  isOpen: boolean

  // Core sheet operations
  pushSheet: (data: GlobalSheetData) => void
  resetSheet: (data: GlobalSheetData) => void
  popSheet: () => void
  closeAllSheets: () => void
  replaceStack: (sheets: GlobalSheetData[]) => void

  // Sheet utilities
  getCurrentSheet: () => GlobalSheetData | null | undefined
  canGoBack: () => boolean
  getStackDepth: () => number

  // Footer management
  updateSheetFooter: (footerData: GlobalSheetData['footer']) => void
  updateUrl: () => void
}

// =============================================================================
// ZUSTAND STORE
// =============================================================================

export const useGlobalSheet = create<GlobalSheetState>((set, get) => ({
  sheetStack: [],
  isOpen: false,

  /**
   * Adds a new sheet to the stack and opens it
   * Automatically syncs URL parameters
   */
  pushSheet: (data: GlobalSheetData) =>
    set((state) => {
      const newStack = [...state.sheetStack, data]
      // Use setTimeout to ensure state is updated before URL sync
      setTimeout(() => get().updateUrl(), 0)

      return {
        sheetStack: newStack,
        isOpen: true,
      }
    }),

  /**
   * Reset sheet to the stack and opens it
   * Automatically syncs URL parameters
   */
  resetSheet: (data: GlobalSheetData) =>
    set(() => {
      const newStack = [data]
      // Use setTimeout to ensure state is updated before URL sync
      setTimeout(() => get().updateUrl(), 0)

      return {
        sheetStack: newStack,
        isOpen: true,
      }
    }),

  /**
   * Removes the top sheet from the stack
   * Calls onClose callback if provided
   */
  popSheet: () =>
    set((state) => {
      if (state.sheetStack.length === 0) return state

      const currentSheet = state.sheetStack[state.sheetStack.length - 1]
      if (!currentSheet) return state
      currentSheet.onClose?.()

      const newStack = state.sheetStack.slice(0, -1)
      setTimeout(() => get().updateUrl(), 0)

      return {
        sheetStack: newStack,
        isOpen: newStack.length > 0,
      }
    }),

  /**
   * Closes all sheets and cleans up URL parameters
   * This is the most complex URL cleanup - it removes all sheet-related params
   */
  closeAllSheets: () =>
    set((state) => {
      // Call onClose for all sheets
      state.sheetStack.forEach((sheet) => sheet.onClose?.())

      // Build list of all URL parameters to remove
      const paramsToRemove: Record<string, null> = { view: null, tab: null }
      state.sheetStack.forEach((sheet) => {
        if (sheet.urlParams) {
          Object.keys(sheet.urlParams).forEach((key) => {
            paramsToRemove[key] = null
          })
        }
      })
      updateUrlParams(paramsToRemove)

      return {
        sheetStack: [],
        isOpen: false,
      }
    }),

  /**
   * Replaces entire sheet stack (used during URL initialization)
   */
  replaceStack: (sheets: GlobalSheetData[]) =>
    set(() => ({
      sheetStack: sheets,
      isOpen: sheets.length > 0,
    })),

  getCurrentSheet: () => {
    const state = get()
    return state.sheetStack.length > 0 ? state.sheetStack[state.sheetStack.length - 1] : null
  },

  canGoBack: () => {
    return get().sheetStack.length > 1
  },

  getStackDepth: () => {
    return get().sheetStack.length
  },

  /**
   * Updates footer data for the current sheet
   * Merges with existing footer data
   */
  updateSheetFooter: (footerData) =>
    set((state) => {
      const currentSheet = state.sheetStack[state.sheetStack.length - 1]
      if (!currentSheet) return state

      const newFooter = footerData
        ? {
            ...currentSheet.footer,
            ...footerData,
            actions: {
              ...currentSheet.footer?.actions,
              ...footerData.actions,
            },
          }
        : footerData

      const newStack = [...state.sheetStack]
      newStack[newStack.length - 1] = {
        ...currentSheet,
        footer: newFooter,
      }

      return { sheetStack: newStack }
    }),

  /**
   * COMPLEX: Synchronizes sheet stack with URL parameters
   * This handles both directions: sheets -> URL and URL -> sheets
   */
  updateUrl: () => {
    const state = get()

    // No sheets open - clean up URL parameters
    if (state.sheetStack.length === 0) {
      const currentParams = getUrlParams()
      const paramsToRemove: Record<string, null> = { view: null }

      // Remove known sheet-related parameters
      const sheetParams = ['clientId', 'caseId', 'opponentId', 'courtId', 'trialId', 'tab']
      sheetParams.forEach((param) => {
        if (currentParams[param]) {
          paramsToRemove[param] = null
        }
      })

      updateUrlParams(paramsToRemove)
      return
    }

    // Build URL parameters from sheet stack
    const viewParams: string[] = []
    const urlParams: Record<string, string> = {}

    state.sheetStack.forEach((sheet) => {
      viewParams.push(sheet.component)

      if (sheet.urlParams) {
        Object.assign(urlParams, sheet.urlParams)
      }
    })

    // First remove all sheet-related parameters that might exist
    const currentParams = getUrlParams()
    const paramsToUpdate: Record<string, string | null> = {
      view: viewParams.join(','),
      ...urlParams,
    }

    // Remove 'tab' if it's not in the new params (it's managed by detail sheets)
    const sheetParams = ['clientId', 'caseId', 'opponentId', 'courtId', 'trialId', 'tab']
    sheetParams.forEach((param) => {
      if (currentParams[param] && !urlParams[param]) {
        paramsToUpdate[param] = null
      }
    })

    updateUrlParams(paramsToUpdate)
  },
}))

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

/**
 * Registry for dynamic component imports
 * Enables code splitting while maintaining type safety
 */
export const SHEET_COMPONENTS = {
  CaseDetails: () => import('../components/cases/case-details-sheet').then((m) => ({ default: m.CaseDetails })),
  CaseForm: () => import('../components/cases/case-form').then((m) => ({ default: m.CaseForm })),
  ClientDetails: () => import('../components/clients/client-details-sheet').then((m) => ({ default: m.ClientDetails })),
  ClientForm: () => import('../components/clients/client-form').then((m) => ({ default: m.ClientForm })),
  OpponentDetails: () =>
    import('../components/opponents/opponent-details-sheet').then((m) => ({
      default: m.OpponentDetails,
    })),
  OpponentForm: () => import('../components/opponents/opponent-form').then((m) => ({ default: m.OpponentForm })),
  TrialForm: () => import('../components/trials/trial-form').then((m) => ({ default: m.TrialForm })),
  TrialDetails: () => import('../components/trials/trial-details-sheet').then((m) => ({ default: m.TrialDetails })),
  CustomContent: () => Promise.resolve({ default: ({ content }: { content: ReactNode }) => content as any }),
} as Record<string, () => Promise<{ default: React.ComponentType<any> }>>

export type SheetComponentType = keyof typeof SHEET_COMPONENTS

// =============================================================================
// SIMPLIFIED GLOBAL API
// =============================================================================

/**
 * Helper function to reduce duplication in sheet opening methods
 */
const openSheet = (type: 'details' | 'form', entity: 'case' | 'client' | 'opponent', props: any) => {
  const componentName = `${entity.charAt(0).toUpperCase() + entity.slice(1)}${type.charAt(0).toUpperCase() + type.slice(1)}`
  const entityId = props[`${entity}Id`]
  const mode = props.mode || (entityId ? 'edit' : 'create')

  // Build URL parameters
  const urlParams: Record<string, string> = {}
  if (entityId) urlParams[`${entity}Id`] = entityId
  if (props.clientId && entity !== 'client') urlParams.clientId = props.clientId
  if (props.opponentId) urlParams.opponentId = props.opponentId
  if (props.courtId) urlParams.courtId = props.courtId
  if (props.currentTab) urlParams.tab = props.currentTab

  // Build sheet data
  const sheetData: GlobalSheetData = {
    id: `${entity}-${type}-${entityId || mode}-${Date.now()}`,
    title: getTitleForSheet(entity, type, mode),
    component: componentName,
    props:
      type === 'details'
        ? {
            [`${entity}Id`]: entityId,
            renderMode: 'content',
          }
        : { ...props },
    controlled: type === 'form',
    size: props.size || getDefaultSizeForSheet(entity, type),
    urlParams,
  }
  if (props.reset) {
    useGlobalSheet.getState().resetSheet(sheetData)
  } else {
    useGlobalSheet.getState().pushSheet(sheetData)
  }
}

/**
 * Gets the appropriate title for each sheet type
 */
const getTitleForSheet = (entity: string, type: string, mode?: string): string => {
  const entityLabels = {
    case: type === 'details' ? 'تفاصيل القضية' : mode === 'create' ? 'إضافة قضية جديدة' : 'تعديل القضية',
    client: type === 'details' ? 'تفاصيل المنوب' : mode === 'create' ? 'إضافة منوب جديد' : 'تعديل المنوب',
    opponent: type === 'details' ? 'تفاصيل الخصم' : mode === 'create' ? 'إضافة خصم جديد' : 'تعديل الخصم',
  }
  return entityLabels[entity as keyof typeof entityLabels] || ''
}

/**
 * Gets the default size for each sheet type
 */
const getDefaultSizeForSheet = (entity: string, type: string): 'sm' | 'md' | 'lg' | 'xl' | 'full' => {
  if (type === 'form' && entity === 'client') return 'xl'
  return 'lg'
}

/**
 * COMPLEX: Creates sheet data from URL parameters
 * This is used when initializing sheets from URL on page load
 */
const createSheetFromUrl = (componentName: string, urlParams: Record<string, string>): GlobalSheetData | null => {
  if (typeof window === 'undefined') return null

  // Extract slug from current URL path
  const pathParts = window.location.pathname.split('/')
  const slug = pathParts[2]
  if (!slug) return null

  // Parse component name to extract entity and type
  const entityMatch = componentName.match(/^(Case|Client|Opponent)(Details|Form)$/)
  if (!entityMatch) return null

  const [, entityName, typeName] = entityMatch
  const entity = entityName?.toLowerCase()
  const type = typeName?.toLowerCase()
  const entityId = urlParams[`${entity}Id`]

  // For details sheets, entity ID is required
  if (type === 'details' && !entityId) return null

  const mode = entityId ? 'edit' : 'create'

  // Build URL parameters for the sheet
  const sheetUrlParams: Record<string, string> = {}
  if (entityId) sheetUrlParams[`${entity}Id`] = entityId
  if (urlParams.clientId && entity !== 'client') sheetUrlParams.clientId = urlParams.clientId
  if (urlParams.opponentId) sheetUrlParams.opponentId = urlParams.opponentId
  if (urlParams.courtId) sheetUrlParams.courtId = urlParams.courtId

  return {
    id: `${entity}-${type}-${entityId || mode}-${Date.now()}`,
    title: getTitleForSheet(entity!, type!, mode),
    component: componentName,
    props:
      type === 'details'
        ? {
            [`${entity}Id`]: entityId,
            renderMode: 'content',
          }
        : {
            mode,
            slug,
            [`${entity}Id`]: entityId,
            clientId: urlParams.clientId || undefined,
            opponentId: urlParams.opponentId || undefined,
            courtId: urlParams.courtId || undefined,
            presetData: {
              ...(urlParams.clientId && { clientId: urlParams.clientId }),
              ...(urlParams.opponentId && { opponentId: urlParams.opponentId }),
              ...(urlParams.courtId && { courtId: urlParams.courtId }),
            },
          },
    controlled: type === 'form',
    size: getDefaultSizeForSheet(entity!, type!),
    urlParams: sheetUrlParams,
  }
}

/**
 * Clean, simple API for opening sheets
 */
export const globalSheet = {
  // Entity-specific methods (maintained for backward compatibility)
  openCaseDetails: (props: { slug: string; caseId: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; reset?: boolean }) => {
    // Include current tab from URL if it exists
    const urlParams = getUrlParams()
    const propsWithTab = urlParams.tab ? { ...props, currentTab: urlParams.tab } : props
    return openSheet('details', 'case', propsWithTab)
  },

  openCaseForm: (props: {
    mode: 'create' | 'edit'
    slug: string
    caseId?: string
    clientId?: string
    opponentId?: string
    courtId?: string
    presetData?: {
      clientId?: string
      opponentId?: string
      courtId?: string
      [key: string]: any
    }
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    reset?: boolean
    onSuccess?: (caseData: any) => void
  }) => openSheet('form', 'case', props),

  openClientDetails: (props: {
    slug: string
    clientId: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    reset?: boolean
  }) => {
    // Include current tab from URL if it exists
    const urlParams = getUrlParams()
    const propsWithTab = urlParams.tab ? { ...props, currentTab: urlParams.tab } : props
    return openSheet('details', 'client', propsWithTab)
  },

  openClientForm: (props: {
    mode: 'create' | 'edit'
    slug: string
    clientId?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    initialData?: any
    onSuccess?: (client: any) => void
  }) => openSheet('form', 'client', props),

  openOpponentDetails: (props: { slug: string; opponentId: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }) =>
    openSheet('details', 'opponent', props),

  openOpponentForm: (props: {
    mode: 'create' | 'edit'
    slug: string
    opponentId?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    initialData?: any
    onSuccess?: (opponent: any) => void
  }) => openSheet('form', 'opponent', props),

  openTrialDetails: (props: { slug: string; trialId: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }) => {
    const urlParams: Record<string, string> = {}
    if (props.trialId) urlParams.trialId = props.trialId

    const sheetData: GlobalSheetData = {
      id: `trial-details-${props.trialId}-${Date.now()}`,
      title: 'تفاصيل الجلسة',
      component: 'TrialDetails',
      props: {
        trialId: props.trialId,
        renderMode: 'content',
      },
      controlled: false,
      size: props.size || 'lg',
      urlParams,
    }

    useGlobalSheet.getState().pushSheet(sheetData)
  },

  openTrialForm: (props: {
    mode: 'create' | 'edit'
    slug: string
    trialId?: string
    caseId?: string
    courtId?: string
    presetData?: {
      caseId?: string
      courtId?: string
      [key: string]: any
    }
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    onSuccess?: () => void
  }) => {
    const mode = props.mode || (props.trialId ? 'edit' : 'create')
    const urlParams: Record<string, string> = {}
    if (props.trialId) urlParams.trialId = props.trialId
    if (props.caseId) urlParams.caseId = props.caseId
    if (props.courtId) urlParams.courtId = props.courtId

    const sheetData: GlobalSheetData = {
      id: `trial-form-${props.trialId || mode}-${Date.now()}`,
      title: mode === 'create' ? 'إضافة جلسة جديدة' : 'تعديل الجلسة',
      component: 'TrialForm',
      props: { ...props },
      controlled: true,
      size: props.size || 'md',
      urlParams,
    }

    useGlobalSheet.getState().pushSheet(sheetData)
  },

  // Generic method for custom sheets
  open: (data: {
    title: string
    component: SheetComponentType
    props?: Record<string, any>
    controlled?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    onClose?: () => void
    urlParams?: Record<string, string>
  }) => {
    useGlobalSheet.getState().pushSheet({
      id: `${data.component.toLowerCase()}-${Date.now()}`,
      ...data,
    })
  },

  // Navigation methods
  back: () => useGlobalSheet.getState().popSheet(),
  closeAll: () => useGlobalSheet.getState().closeAllSheets(),
  canGoBack: () => useGlobalSheet.getState().canGoBack(),

  // Utility methods
  getNavigationInfo: () => {
    const state = useGlobalSheet.getState()
    const stack = state.sheetStack
    return {
      canGoBack: stack.length > 1,
      previousSheetTitle: stack.length > 1 ? stack[stack.length - 2]?.title : null,
      stackDepth: stack.length,
      currentSheet: stack.length > 0 ? stack[stack.length - 1] : null,
    }
  },

  // Footer management
  updateFooter: (footerData: GlobalSheetData['footer']) => {
    useGlobalSheet.getState().updateSheetFooter(footerData)
  },

  updateFooterState: (isLoading: boolean, errorMessage?: string) => {
    useGlobalSheet.getState().updateSheetFooter({
      actions: { isLoading, errorMessage },
    })
  },

  /**
   * COMPLEX: Initializes sheets from URL parameters on page load
   * This enables direct navigation to URLs with open sheets
   */
  initializeFromUrl: () => {
    if (typeof window === 'undefined') return

    const urlParams = getUrlParams()
    const viewParam = urlParams.view

    if (!viewParam) return

    // Parse comma-separated component names from URL
    const views = viewParam.split(',').map((v) => v.trim())
    const sheets: GlobalSheetData[] = []

    // Create sheet data for each component
    views.forEach((viewName) => {
      const sheetData = createSheetFromUrl(viewName, urlParams)
      if (sheetData) {
        sheets.push(sheetData)
      }
    })

    // Replace current stack with URL-derived sheets
    if (sheets.length > 0) {
      useGlobalSheet.getState().replaceStack(sheets)
    }
  },
}
