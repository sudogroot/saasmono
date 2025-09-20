import { z } from 'zod'

// Education Subject Schemas
export const EducationSubjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayNameAr: z.string(),
  displayDescriptionAr: z.string().nullable(),
  institutionLevelId: z.string().uuid(),
  educationLevels: z.array(z.object({
    id: z.string().uuid(),
    level: z.number(),
    section: z.string().nullable(),
    displayNameAr: z.string().nullable(),
    isOptional: z.boolean(),
  })),
})

export const EducationSubjectListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayNameAr: z.string(),
  displayDescriptionAr: z.string().nullable(),
  institutionLevelId: z.string().uuid(),
  educationLevels: z.array(z.object({
    id: z.string().uuid(),
    level: z.number(),
    section: z.string().nullable(),
    displayNameAr: z.string().nullable(),
    isOptional: z.boolean(),
  })),
})

// Education Level Schemas
export const EducationLevelSchema = z.object({
  id: z.string().uuid(),
  level: z.number(),
  section: z.string().nullable(),
  displayNameAr: z.string().nullable(),
  displayNameEn: z.string().nullable(),
  displayNameFr: z.string().nullable(),
  institutionLevelId: z.string().uuid(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  educationSubjects: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayNameAr: z.string(),
    displayDescriptionAr: z.string().nullable(),
    isOptional: z.boolean(),
  })),
})

export const EducationLevelListItemSchema = z.object({
  id: z.string().uuid(),
  level: z.number(),
  section: z.string().nullable(),
  displayNameAr: z.string().nullable(),
  displayNameEn: z.string().nullable(),
  displayNameFr: z.string().nullable(),
  institutionLevelId: z.string().uuid(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  educationSubjects: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayNameAr: z.string(),
    displayDescriptionAr: z.string().nullable(),
    isOptional: z.boolean(),
  })),
})

// Institution Level Schemas
export const InstitutionLevelSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(['JARDIN', 'PRIMAIRE', 'COLLEGE', 'SECONDAIRE', 'SUPERIEUR']),
  displayNameAr: z.string(),
  displayNameEn: z.string(),
  displayNameFr: z.string(),
})

// Education Level-Subject Association Schemas
export const EducationLevelSubjectSchema = z.object({
  id: z.string().uuid(),
  educationLevelId: z.string().uuid(),
  educationSubjectId: z.string().uuid(),
  isOptional: z.boolean(),
  createdAt: z.date(),
  levelDisplayNameAr: z.string().nullable(),
  levelLevel: z.number(),
  levelSection: z.string().nullable(),
  subjectName: z.string(),
  subjectDisplayNameAr: z.string(),
})

// Type exports
export type EducationSubject = z.infer<typeof EducationSubjectSchema>
export type EducationSubjectListItem = z.infer<typeof EducationSubjectListItemSchema>
export type EducationLevel = z.infer<typeof EducationLevelSchema>
export type EducationLevelListItem = z.infer<typeof EducationLevelListItemSchema>
export type InstitutionLevel = z.infer<typeof InstitutionLevelSchema>
export type EducationLevelSubject = z.infer<typeof EducationLevelSubjectSchema>