import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import * as educationSchema from "../../schema/education";
import { seedSecondaireEducation } from "../utils/seedEducation";
import pkg from 'pg';
const { Pool } = pkg;

async function runSecondaireEducationSeed(orgId: string) {
  console.log(`🌱 Starting SECONDAIRE school education seed for organization: ${orgId}\n`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle(pool, { schema: educationSchema });

  try {
    console.log('📋 Fetching SECONDAIRE institution level...');

    const result = await seedSecondaireEducation(db, orgId);

    console.log('✅ Found SECONDAIRE institution level');

    if (result.educationLevels.length === 0 && result.educationSubjects.length === 0) {
      console.log(`⚠️  SECONDAIRE school education data already exists for organization ${orgId}`);
      console.log(`Skipping seed.`);
      return;
    }

    console.log('\n🎉 SECONDAIRE school education seed completed successfully!');
    console.log(`📊 Summary for organization ${orgId}:`);
    console.log(`  - ${result.educationLevels.length} education levels`);
    console.log(`  - ${result.educationSubjects.length} education subjects`);

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
runSecondaireEducationSeed(orgId).catch((error) => {
  console.error('❌ SECONDAIRE school education seed process failed:', error);
  process.exit(1);
});
