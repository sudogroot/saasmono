import { and, eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { SECONDAIRE_SCHOOL_LEVELS, SECONDAIRE_SCHOOL_SUBJECTS } from '../../educationData/data'
import * as educationSchema from '../../schema/education'

// Institution Levels Data - Shared constant
export const INSTITUTION_LEVELS = [
  {
    name: 'JARDIN' as const,
    displayNameEn: 'Preschool',
    displayNameAr: 'الروضة / التحضيري',
    displayNameFr: "Jardin d'enfants",
  },
  {
    name: 'PRIMAIRE' as const,
    displayNameEn: 'Primary School',
    displayNameAr: 'المرحلة الابتدائية',
    displayNameFr: 'École primaire',
  },
  {
    name: 'COLLEGE' as const,
    displayNameEn: 'Middle School',
    displayNameAr: 'المرحلة الإعدادية',
    displayNameFr: 'Collège',
  },
  {
    name: 'SECONDAIRE' as const,
    displayNameEn: 'High School',
    displayNameAr: 'التعليم الثانوي',
    displayNameFr: 'Enseignement secondaire',
  },
  {
    name: 'SUPERIEUR' as const,
    displayNameEn: 'Higher Education',
    displayNameAr: 'التعليم العالي',
    displayNameFr: 'Enseignement supérieur',
  },
]

// Helper function - Shared utility
export function matchesLevelPattern(levelCodeName: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1)
    return levelCodeName.startsWith(prefix)
  }
  return levelCodeName === pattern
}

// Shared function to seed institution levels
export async function seedInstitutionLevels(db: NodePgDatabase) {
  const existingLevels = await db.select().from(educationSchema.institutionLevel)

  const existingNames = new Set(existingLevels.map((level) => level.name))
  const levelsToInsert = INSTITUTION_LEVELS.filter((level) => !existingNames.has(level.name))

  if (levelsToInsert.length === 0) {
    return existingLevels
  }

  const insertedLevels = await db.insert(educationSchema.institutionLevel).values(levelsToInsert).returning()

  return [...existingLevels, ...insertedLevels]
}

// Shared function to seed SECONDAIRE education
export async function seedSecondaireEducation(db: NodePgDatabase, orgId: string) {
  // Get SECONDAIRE institution level ID
  const institutionLevelResult = await db
    .select()
    .from(educationSchema.institutionLevel)
    .where(eq(educationSchema.institutionLevel.name, 'SECONDAIRE'))

  if (institutionLevelResult.length === 0) {
    throw new Error('SECONDAIRE institution level not found. Please run the institutionLevel seed first.')
  }

  const institutionLevelId = institutionLevelResult[0].id

  // Check if SECONDAIRE education data already exists for this organization
  const existingLevels = await db
    .select()
    .from(educationSchema.educationLevel)
    .where(
      and(
        eq(educationSchema.educationLevel.orgId, orgId),
        eq(educationSchema.educationLevel.institutionLevelId, institutionLevelId)
      )
    )

  if (existingLevels.length > 0) {
    // Return existing data
    const existingSubjects = await db
      .select()
      .from(educationSchema.educationSubject)
      .where(
        and(
          eq(educationSchema.educationSubject.orgId, orgId),
          eq(educationSchema.educationSubject.institutionLevelId, institutionLevelId)
        )
      )

    return {
      educationLevels: existingLevels,
      educationSubjects: existingSubjects,
    }
  }

  // Convert SECONDAIRE_SCHOOL_LEVELS to seed format
  const educationLevels = SECONDAIRE_SCHOOL_LEVELS.map((level) => ({
    institutionLevelId: institutionLevelId,
    section: level.section,
    level: level.level,
    displayNameEn: level.displayName?.en,
    displayNameFr: level.displayName?.fr,
    displayNameAr: level.displayName?.ar,
    isDefault: true,
    orgId: orgId,
  }))

  // Convert SECONDAIRE_SCHOOL_SUBJECTS to seed format
  const educationSubjects = SECONDAIRE_SCHOOL_SUBJECTS.map((subject) => ({
    institutionLevelId: institutionLevelId,
    name: subject.displayName.en,
    description: subject.displayDescription?.en,
    displayNameEn: subject.displayName.en,
    displayNameFr: subject.displayName.fr,
    displayNameAr: subject.displayName.ar,
    displayDescriptionEn: subject.displayDescription?.en,
    displayDescriptionFr: subject.displayDescription?.fr,
    displayDescriptionAr: subject.displayDescription?.ar,
    orgId: orgId,
  }))

  // Run all operations in a transaction
  const result = await db.transaction(async (tx) => {
    // Insert education levels and get their IDs
    const insertedLevels = await tx.insert(educationSchema.educationLevel).values(educationLevels).returning()

    // Insert education subjects and get their IDs
    const insertedSubjects = await tx.insert(educationSchema.educationSubject).values(educationSubjects).returning()

    // Create level-subject relationships using the returned IDs
    const levelSubjectRelations: any[] = []

    SECONDAIRE_SCHOOL_SUBJECTS.forEach((subject) => {
      const insertedSubject = insertedSubjects.find((s) => s.name === subject.displayName.en)
      if (!insertedSubject) return

      if (subject.levelCodeName && subject.levelCodeName.length > 0) {
        // Subject has specific level assignments
        subject.levelCodeName.forEach((levelPattern) => {
          // Find matching levels
          SECONDAIRE_SCHOOL_LEVELS.forEach((level) => {
            if (matchesLevelPattern(level.codeName, levelPattern)) {
              const insertedLevel = insertedLevels.find((l) => l.section === level.section && l.level === level.level)
              if (insertedLevel) {
                levelSubjectRelations.push({
                  educationLevelId: insertedLevel.id,
                  educationSubjectId: insertedSubject.id,
                  isOptional: false,
                  orgId: orgId,
                })
              }
            }
          })
        })
      } else {
        // Subject without levelCodeName should be linked to ALL SECONDAIRE levels
        insertedLevels.forEach((insertedLevel) => {
          levelSubjectRelations.push({
            educationLevelId: insertedLevel.id,
            educationSubjectId: insertedSubject.id,
            isOptional: subject.isOptional || false,
            orgId: orgId,
          })
        })
      }

      // Handle levelCodeNameOptional array for specific level optionality
      if (subject.levelCodeNameOptional && subject.levelCodeNameOptional.length > 0) {
        subject.levelCodeNameOptional.forEach((levelPattern) => {
          // Find matching levels
          SECONDAIRE_SCHOOL_LEVELS.forEach((level) => {
            if (matchesLevelPattern(level.codeName, levelPattern)) {
              const insertedLevel = insertedLevels.find((l) => l.section === level.section && l.level === level.level)
              if (insertedLevel) {
                levelSubjectRelations.push({
                  educationLevelId: insertedLevel.id,
                  educationSubjectId: insertedSubject.id,
                  isOptional: true,
                  orgId: orgId,
                })
              }
            }
          })
        })
      }
    })

    // Insert level-subject relationships
    if (levelSubjectRelations.length > 0) {
      await tx.insert(educationSchema.educationLevelSubject).values(levelSubjectRelations)
    }

    return {
      educationLevels: insertedLevels,
      educationSubjects: insertedSubjects,
    }
  })

  return result
}
