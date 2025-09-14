import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as educationSchema from "../../schema/education";
import pkg from 'pg';
const { Pool } = pkg;

interface SeedInstitutionLevel {
  name: educationSchema.InstitutionLevelType;
  displayNameEn: string;
  displayNameAr: string;
  displayNameFr: string;
}

const INSTITUTION_LEVELS: SeedInstitutionLevel[] = [
  {
    name: 'JARDIN',
    displayNameEn: 'Preschool',
    displayNameAr: 'الروضة / التحضيري',
    displayNameFr: 'Jardin d\'enfants'
  },
  {
    name: 'PRIMAIRE',
    displayNameEn: 'Primary School',
    displayNameAr: 'المرحلة الابتدائية',
    displayNameFr: 'École primaire'
  },
  {
    name: 'COLLEGE',
    displayNameEn: 'Middle School',
    displayNameAr: 'المرحلة الإعدادية',
    displayNameFr: 'Collège'
  },
  {
    name: 'SECONDAIRE',
    displayNameEn: 'High School',
    displayNameAr: 'التعليم الثانوي',
    displayNameFr: 'Enseignement secondaire'
  },
  {
    name: 'SUPERIEUR',
    displayNameEn: 'Higher Education',
    displayNameAr: 'التعليم العالي',
    displayNameFr: 'Enseignement supérieur'
  }
];

async function seedInstitutionLevels() {
  console.log('🌱 Starting institution levels seed\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle(pool, { schema: educationSchema });

  try {
    // Check which institution levels already exist
    const existingLevels = await db
      .select()
      .from(educationSchema.institutionLevel);

    const existingNames = new Set(existingLevels.map(level => level.name));

    // Filter out levels that already exist
    const levelsToInsert = INSTITUTION_LEVELS.filter(level => !existingNames.has(level.name));

    if (levelsToInsert.length === 0) {
      console.log('⚠️  All institution levels already exist. Skipping seed.');
      return;
    }

    console.log(`📚 Creating ${levelsToInsert.length} new institution levels...`);

    // Insert new institution levels
    const insertedLevels = await db
      .insert(educationSchema.institutionLevel)
      .values(levelsToInsert)
      .returning();

    console.log(`✅ Created ${insertedLevels.length} institution levels`);

    insertedLevels.forEach(level => {
      console.log(`  - ${level.name}: ${level.displayNameEn}`);
    });

    console.log('\n🎉 Institution levels seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed
seedInstitutionLevels().catch((error) => {
  console.error('❌ Institution levels seed process failed:', error);
  process.exit(1);
});
