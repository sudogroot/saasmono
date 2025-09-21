import { config } from 'dotenv'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pkg from 'pg'
config()
const { Pool } = pkg

async function showDatabaseTables() {
  console.log('📊 Database Tables Overview\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  })

  const db = drizzle(pool)

  try {
    // Get all table names dynamically
    console.log('🔍 Discovering all tables...')
    const tablesResult = await db.execute(sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'drizzle%'
      ORDER BY table_name;
    `)

    // Handle different result formats
    let allTables: string[] = []
    if (Array.isArray(tablesResult)) {
      allTables = tablesResult.map((row) => (row as any).table_name as string)
    } else if (tablesResult && typeof tablesResult === 'object' && 'rows' in tablesResult) {
      allTables = (tablesResult as any).rows.map((row: any) => row.table_name as string)
    } else {
      throw new Error('Unexpected result format from tables query')
    }
    console.log(`📋 Found ${allTables.length} tables in the database:\n`)

    // Get detailed information about each table
    for (const tableName of allTables) {
      try {
        // Get record count
        const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`))

        // Handle different result formats for count
        let count: number = 0
        if (Array.isArray(countResult) && countResult.length > 0) {
          count = parseInt((countResult[0] as any).count as string)
        } else if (countResult && typeof countResult === 'object' && 'rows' in countResult) {
          const rows = (countResult as any).rows
          if (rows && rows.length > 0) {
            count = parseInt(rows[0].count as string)
          }
        }

        // Get column info
        const columnsResult = await db.execute(sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ${tableName}
          ORDER BY ordinal_position;
        `)

        // Handle different result formats for columns
        let columns: any[] = []
        if (Array.isArray(columnsResult)) {
          columns = columnsResult
        } else if (columnsResult && typeof columnsResult === 'object' && 'rows' in columnsResult) {
          columns = (columnsResult as any).rows
        }

        console.log(`📄 ${tableName} (${count} records)`)
        console.log(`   Columns: ${columns.map((col) => col.column_name).join(', ')}`)

        // Show some sample data if table has records (limited to first few columns and rows)
        if (count > 0 && count <= 10) {
          try {
            const sampleResult = await db.execute(sql.raw(`SELECT * FROM "${tableName}" LIMIT 3`))

            // Handle different result formats for sample data
            let samples: any[] = []
            if (Array.isArray(sampleResult)) {
              samples = sampleResult
            } else if (sampleResult && typeof sampleResult === 'object' && 'rows' in sampleResult) {
              samples = (sampleResult as any).rows
            }

            if (samples.length > 0) {
              console.log(`   Sample: ${JSON.stringify(samples[0], null, 2).replace(/\n/g, ' ')}`)
            }
          } catch (sampleError) {
            console.log(`   Sample: Unable to fetch sample data`)
          }
        } else if (count > 10) {
          console.log(`   Note: Too many records to show sample`)
        }
        console.log()
      } catch (error) {
        console.log(`📄 ${tableName} (error getting details: ${(error as Error).message})\n`)
      }
    }

    // Summary
    const totalCountsResult = await Promise.all(
      allTables.map(async (tableName) => {
        try {
          const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`))

          // Handle different result formats for count
          let count: number = 0
          if (Array.isArray(countResult) && countResult.length > 0) {
            count = parseInt((countResult[0] as any).count as string)
          } else if (countResult && typeof countResult === 'object' && 'rows' in countResult) {
            const rows = (countResult as any).rows
            if (rows && rows.length > 0) {
              count = parseInt(rows[0].count as string)
            }
          }
          return count
        } catch {
          return 0
        }
      })
    )

    const totalRecords = totalCountsResult.reduce((sum, count) => sum + count, 0)

    console.log('📊 Summary:')
    console.log(`   - Total tables: ${allTables.length}`)
    console.log(`   - Total records: ${totalRecords}`)
    console.log()

    // Show foreign key relationships
    console.log('🔗 Foreign Key Relationships:')
    const fkResult = await db.execute(sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `)

    // Handle different result formats for foreign keys
    let foreignKeys: any[] = []
    if (Array.isArray(fkResult)) {
      foreignKeys = fkResult
    } else if (fkResult && typeof fkResult === 'object' && 'rows' in fkResult) {
      foreignKeys = (fkResult as any).rows
    }

    if (foreignKeys.length > 0) {
      foreignKeys.forEach((fk: any) => {
        console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
      })
    } else {
      console.log('   No foreign key relationships found')
    }
  } catch (error) {
    console.error('❌ Failed to analyze database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the analysis
showDatabaseTables().catch((error) => {
  console.error('❌ Database analysis failed:', error)
  process.exit(1)
})
