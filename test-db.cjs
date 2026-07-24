const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '.env') })

const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres')
const user = process.env.DB_USER || url.username || 'postgres'
const password = process.env.DB_PASSWORD || url.password || 'postgres'
const host = process.env.DB_HOST || url.hostname || 'localhost'
const port = process.env.DB_PORT || url.port || 5432
const database = process.env.DB_NAME || url.pathname.replace(/^\//, '') || 'postgres'
const schema = process.env.DB_SCHEMA || url.searchParams.get('schema') || 'sigyn'

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function main() {
  try {
    await client.connect()
    await client.query(`SET search_path TO "${schema}"`)
    console.log('✓ Connected to PostgreSQL')
    const res = await client.query('SELECT NOW() AS time, current_database() AS db, current_schema() AS schema')
    const row = res.rows[0]
    console.log(`  Time  : ${row.time}`)
    console.log(`  DB    : ${row.db}`)
    console.log(`  Schema: ${row.schema}`)

    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = $1 ORDER BY table_name
    `, [schema])
    console.log(`  Tables: ${tables.rows.map(r => r.table_name).join(', ')}`)
  } catch (err) {
    console.error('✗ Connection failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
