import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";
import { SECONDAIRE_SCHOOL_LEVELS, SECONDAIRE_SCHOOL_SUBJECTS } from "../../educationData/data";
import * as educationSchema from "../../schema/education";
import pkg from 'pg';
const { Pool } = pkg;

interface SeedEducationLevel {
  institutionLevelId: string;
  codeName: string;
  section?: string;
  level: number;
  displayNameEn?: string;
  displayNameFr?: string;
  displayNameAr?: string;
  isDefault: boolean;
  orgId: string;
}

interface SeedEducationSubject {
  institutionLevelId: string;
  name: string;
  description?: string;
  displayNameEn: string;
  displayNameFr: string;
  displayNameAr: string;
  displayDescriptionEn?: string;
  displayDescriptionFr?: string;
  displayDescriptionAr?: string;
  orgId: string;
}

interface SeedEducationLevelSubject {
  educationLevelId: string;
  educationSubjectId: string;
  isOptional: boolean;
  orgId: string;
}

function matchesLevelPattern(levelCodeName: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1);
    return levelCodeName.startsWith(prefix);
  }
  return levelCodeName === pattern;
}

async function seedSecondaireEducation(orgId: string) {
  console.log(`🌱 Starting SECONDAIRE school education seed for organization: ${orgId}\n`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle(pool, { schema: educationSchema });

  try {
    // Get SECONDAIRE institution level ID
    console.log('📋 Fetching SECONDAIRE institution level...');
    const institutionLevelResult = await db
      .select()
      .from(educationSchema.institutionLevel)
      .where(eq(educationSchema.institutionLevel.name, 'SECONDAIRE'));

    if (institutionLevelResult.length === 0) {
      throw new Error('SECONDAIRE institution level not found. Please run the institutionLevel seed first.');
    }

    const institutionLevelId = institutionLevelResult[0].id;
    console.log(`✅ Found SECONDAIRE institution level: ${institutionLevelId}`);

    // Check if SECONDAIRE education data already exists for this organization
    const existingLevels = await db
      .select()
      .from(educationSchema.educationLevel)
      .where(
        and(
          eq(educationSchema.educationLevel.orgId, orgId),
          eq(educationSchema.educationLevel.institutionLevelId, institutionLevelId)
        )
      );

    if (existingLevels.length > 0) {
      console.log(`⚠️  SECONDAIRE school education data already exists for organization ${orgId}`);
      console.log(`Found ${existingLevels.length} existing levels. Skipping seed.`);
      return;
    }

    // Convert SECONDAIRE_SCHOOL_LEVELS to seed format
    const educationLevels: SeedEducationLevel[] = SECONDAIRE_SCHOOL_LEVELS.map(level => ({
      institutionLevelId: institutionLevelId,
      codeName: level.codeName,
      section: level.section,
      level: level.level,
      displayNameEn: level.displayName?.en,
      displayNameFr: level.displayName?.fr,
      displayNameAr: level.displayName?.ar,
      isDefault: true,
      orgId: orgId
    }));

    // Convert SECONDAIRE_SCHOOL_SUBJECTS to seed format
    const educationSubjects: SeedEducationSubject[] = SECONDAIRE_SCHOOL_SUBJECTS.map(subject => ({
      institutionLevelId: institutionLevelId,
      name: subject.displayName.en,
      description: subject.displayDescription?.en,
      displayNameEn: subject.displayName.en,
      displayNameFr: subject.displayName.fr,
      displayNameAr: subject.displayName.ar,
      displayDescriptionEn: subject.displayDescription?.en,
      displayDescriptionFr: subject.displayDescription?.fr,
      displayDescriptionAr: subject.displayDescription?.ar,
      orgId: orgId
    }));

    // Run all operations in a transaction
    let relationshipCount = 0;
    await db.transaction(async (tx) => {
      // Insert education levels and get their IDs
      console.log('📚 Creating education levels...');
      const insertedLevels = await tx.insert(educationSchema.educationLevel).values(educationLevels).returning();
      console.log(`✅ Created ${insertedLevels.length} education levels`);

      // Insert education subjects and get their IDs
      console.log('📖 Creating education subjects...');
      const insertedSubjects = await tx.insert(educationSchema.educationSubject).values(educationSubjects).returning();
      console.log(`✅ Created ${insertedSubjects.length} education subjects`);

      // Create level-subject relationships using the returned IDs
      const levelSubjectRelations: SeedEducationLevelSubject[] = [];

      SECONDAIRE_SCHOOL_SUBJECTS.forEach(subject => {
        const insertedSubject = insertedSubjects.find(s => s.name === subject.displayName.en);
        if (!insertedSubject) return;

        if (subject.levelCodeName && subject.levelCodeName.length > 0) {
          // Subject has specific level assignments
          subject.levelCodeName.forEach(levelPattern => {
            // Find matching levels
            SECONDAIRE_SCHOOL_LEVELS.forEach(level => {
              if (matchesLevelPattern(level.codeName, levelPattern)) {
                const insertedLevel = insertedLevels.find(l => l.codeName === level.codeName);
                if (insertedLevel) {
                  levelSubjectRelations.push({
                    educationLevelId: insertedLevel.id,
                    educationSubjectId: insertedSubject.id,
                    isOptional: false,
                    orgId: orgId
                  });
                }
              }
            });
          });
        } else {
          // Subject without levelCodeName should be linked to ALL SECONDAIRE levels
          insertedLevels.forEach(insertedLevel => {
            levelSubjectRelations.push({
              educationLevelId: insertedLevel.id,
              educationSubjectId: insertedSubject.id,
              isOptional: subject.isOptional || false,
              orgId: orgId
            });
          });
        }

        // Handle levelCodeNameOptional array for specific level optionality
        if (subject.levelCodeNameOptional && subject.levelCodeNameOptional.length > 0) {
          subject.levelCodeNameOptional.forEach(levelPattern => {
            // Find matching levels
            SECONDAIRE_SCHOOL_LEVELS.forEach(level => {
              if (matchesLevelPattern(level.codeName, levelPattern)) {
                const insertedLevel = insertedLevels.find(l => l.codeName === level.codeName);
                if (insertedLevel) {
                  levelSubjectRelations.push({
                    educationLevelId: insertedLevel.id,
                    educationSubjectId: insertedSubject.id,
                    isOptional: true,
                    orgId: orgId
                  });
                }
              }
            });
          });
        }
      });

      // Insert level-subject relationships
      console.log('🔗 Creating level-subject relationships...');
      await tx.insert(educationSchema.educationLevelSubject).values(levelSubjectRelations);
      relationshipCount = levelSubjectRelations.length;
      console.log(`✅ Created ${relationshipCount} level-subject relationships`);
    });

    console.log('\n🎉 SECONDAIRE school education seed completed successfully!');
    console.log(`📊 Summary for organization ${orgId}:`);
    console.log(`  - ${educationLevels.length} education levels`);
    console.log(`  - ${educationSubjects.length} education subjects`);
    console.log(`  - ${relationshipCount} level-subject relationships`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get organization ID from command line arguments
const orgId = process.argv[2];

if (!orgId) {
  console.error('❌ Organization ID is required!');
  console.error('Usage: pnpm run seed:level:secondaire <orgId>');
  console.error('Example: pnpm run seed:level:secondaire org_default_school');
  process.exit(1);
}

// Run the seed
seedSecondaireEducation(orgId).catch((error) => {
  console.error('❌ SECONDAIRE school education seed process failed:', error);
  process.exit(1);
});
