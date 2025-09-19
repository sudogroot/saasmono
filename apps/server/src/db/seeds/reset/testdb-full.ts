import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pkg from 'pg';
const { Pool } = pkg;

async function fullResetTestDatabase() {
  console.log('🔄 Starting FULL dynamic test database reset...\n');
  console.log('⚠️  This will clear ALL data including institution levels!\n');

  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL!,
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

    // Clear ALL tables using TRUNCATE CASCADE
    console.log('\n🗑️  Clearing ALL tables (including institution levels)...');

    await db.transaction(async (tx) => {
      // Disable foreign key constraints temporarily
      await tx.execute(sql`SET session_replication_role = replica;`);

      console.log(`🔧 Clearing all ${allTables.length} tables...`);

      for (const tableName of allTables) {
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

    if (totalRecordsAfter === 0) {
      console.log('\n🎉 FULL test database reset completed successfully!');
      console.log('✅ ALL data has been cleared (including institution levels).');
      console.log('💡 You may need to run seed:institutionLevel to restore reference data.');
    } else {
      console.log('\n⚠️  FULL database reset completed with some data remaining:');
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

        if (count > 0) {
          console.log(`  - ${tableName}: ${count} records remaining`);
        }
      }
    }

  } catch (error) {
    console.error('❌ FULL test database reset failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get confirmation from command line
const confirmation = process.argv[2];

if (confirmation !== '--confirm') {
  console.error('❌ FULL test database reset requires confirmation!');
  console.error('Usage: pnpm run seed:reset:testdb-full --confirm');
  console.error('\n⚠️  This will DELETE ALL data in the database including institution levels!');
  console.error('⚠️  This is more destructive than the regular testdb reset.');
  console.error('Only run this command if you want to completely reset everything.');
  process.exit(1);
}

// Run the reset
fullResetTestDatabase().catch((error) => {
  console.error('❌ FULL test database reset process failed:', error);
  process.exit(1);
});
