import { create } from 'zustand'

/**
 * Store for preserving form state when navigating between sheets
 * This allows forms to maintain their state when a user opens a nested sheet
 * and then returns to the original form
 */
interface SheetFormStateStore {
  // Stores form values by a unique key (typically the sheet ID or form name)
  formStates: Record<string, Record<string, any>>

  // Save form state
  saveFormState: (key: string, values: Record<string, any>) => void

  // Retrieve form state
  getFormState: (key: string) => Record<string, any> | undefined

  // Clear specific form state
  clearFormState: (key: string) => void

  // Clear all form states
  clearAllFormStates: () => void
}

export const useSheetFormState = create<SheetFormStateStore>((set, get) => ({
  formStates: {},

  saveFormState: (key: string, values: Record<string, any>) => {
    set((state) => ({
      formStates: {
        ...state.formStates,
        [key]: values,
      },
    }))
  },

  getFormState: (key: string) => {
    return get().formStates[key]
  },

  clearFormState: (key: string) => {
    set((state) => {
      const { [key]: _, ...rest } = state.formStates
      return { formStates: rest }
    })
  },

  clearAllFormStates: () => {
    set({ formStates: {} })
  },
}))
