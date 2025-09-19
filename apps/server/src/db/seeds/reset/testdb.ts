import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pkg from 'pg';
const { Pool } = pkg;

async function resetTestDatabase() {
  console.log('🔄 Starting dynamic test database reset...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle(pool);

  try {
    // First, get all table names dynamically
    console.log('🔍 Discovering all tables in database...');
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'drizzle%'
      ORDER BY table_name;
    `);

    console.log('Raw tablesResult:', tablesResult);

    // Handle different result formats
    let allTables: string[] = [];
    if (Array.isArray(tablesResult)) {
      allTables = tablesResult.map(row => (row as any).table_name as string);
    } else if (tablesResult && typeof tablesResult === 'object' && 'rows' in tablesResult) {
      allTables = (tablesResult as any).rows.map((row: any) => row.table_name as string);
    } else {
      throw new Error('Unexpected result format from tables query');
    }

    console.log(`📊 Found ${allTables.length} tables:`, allTables.join(', '));

    // Get table counts before deletion
    console.log('\n📋 Current table counts:');
    const beforeCounts: Record<string, number> = {};
    for (const tableName of allTables) {
      const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`));

      // Handle different result formats for count
      let count: number = 0;
      if (Array.isArray(countResult) && countResult.length > 0) {
        count = parseInt((countResult[0] as any).count as string);
      } else if (countResult && typeof countResult === 'object' && 'rows' in countResult) {
        const rows = (countResult as any).rows;
        if (rows && rows.length > 0) {
          count = parseInt(rows[0].count as string);
        }
      }

      beforeCounts[tableName] = count;
      if (count > 0) {
        console.log(`  - ${tableName}: ${count} records`);
      }
    }

    const totalRecordsBefore = Object.values(beforeCounts).reduce((sum, count) => sum + count, 0);
    console.log(`\n📊 Total records before cleanup: ${totalRecordsBefore}`);

    if (totalRecordsBefore === 0) {
      console.log('✅ Database is already empty!');
      return;
    }

    // Clear all tables using TRUNCATE CASCADE for efficiency
    console.log('\n🗑️  Clearing all tables...');

    await db.transaction(async (tx) => {
      // Disable foreign key constraints temporarily
      await tx.execute(sql`SET session_replication_role = replica;`);

      // Truncate all tables except institution_level (preserve global reference data)
      const tablesToClear = allTables.filter(table => table !== 'institution_level');

      console.log(`🔧 Clearing ${tablesToClear.length} tables (preserving institution_level)...`);

      for (const tableName of tablesToClear) {
        try {
          await tx.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`));
          console.log(`  ✅ Cleared ${tableName}`);
        } catch (error) {
          console.log(`  ⚠️  Failed to clear ${tableName}:`, (error as Error).message);
        }
      }

      // Re-enable foreign key constraints
      await tx.execute(sql`SET session_replication_role = DEFAULT;`);
    });

    // Verify the reset by counting records after deletion
    console.log('\n🔍 Verifying cleanup...');
    const afterCounts: Record<string, number> = {};
    let totalRecordsAfter = 0;

    for (const tableName of allTables) {
      const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`));

      // Handle different result formats for count
      let count: number = 0;
      if (Array.isArray(countResult) && countResult.length > 0) {
        count = parseInt((countResult[0] as any).count as string);
      } else if (countResult && typeof countResult === 'object' && 'rows' in countResult) {
        const rows = (countResult as any).rows;
        if (rows && rows.length > 0) {
          count = parseInt(rows[0].count as string);
        }
      }

      afterCounts[tableName] = count;
      totalRecordsAfter += count;

      if (count > 0) {
        console.log(`  - ${tableName}: ${count} records remaining`);
      }
    }

    // Summary
    const recordsCleared = totalRecordsBefore - totalRecordsAfter;
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Records before: ${totalRecordsBefore}`);
    console.log(`  - Records after: ${totalRecordsAfter}`);
    console.log(`  - Records cleared: ${recordsCleared}`);

    if (totalRecordsAfter === afterCounts['institution_level'] || totalRecordsAfter === 0) {
      console.log('\n🎉 Test database reset completed successfully!');
      console.log('✅ All test data has been cleared.');

      if (afterCounts['institution_level'] > 0) {
        console.log(`ℹ️  Institution levels preserved: ${afterCounts['institution_level']} records (global reference data)`);
      }
    } else {
      console.log('\n⚠️  Test database reset completed with some data remaining:');
      Object.entries(afterCounts).forEach(([table, count]) => {
        if (count > 0 && table !== 'institution_level') {
          console.log(`  - ${table}: ${count} records remaining`);
        }
      });
    }

    // Show preserved institution levels if any
    if (afterCounts['institution_level'] > 0) {
      console.log('\n📚 Preserved Institution Levels:');
      const levelsResult = await db.execute(sql`
        SELECT name, "displayNameEn"
        FROM institution_level
        ORDER BY name;
      `);

      // Handle different result formats for levels
      let levels: any[] = [];
      if (Array.isArray(levelsResult)) {
        levels = levelsResult;
      } else if (levelsResult && typeof levelsResult === 'object' && 'rows' in levelsResult) {
        levels = (levelsResult as any).rows;
      }

      levels.forEach((level: any) => {
        console.log(`  - ${level.name}: ${level.displayNameEn}`);
      });
    }

  } catch (error) {
    console.error('❌ Test database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get confirmation from command line
const confirmation = process.argv[2];

if (confirmation !== '--confirm') {
  console.error('❌ Test database reset requires confirmation!');
  console.error('Usage: pnpm run seed:reset:testdb --confirm');
  console.error('\n⚠️  This will DELETE ALL test data in the database!');
  console.error('Only run this command if you are sure you want to reset the test database.');
  process.exit(1);
}

// Run the reset
resetTestDatabase().catch((error) => {
  console.error('❌ Test database reset process failed:', error);
  process.exit(1);
});