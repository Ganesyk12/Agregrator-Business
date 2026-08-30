import { writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const guardPath = join(import.meta.dirname, 'config', 'guard.json')

const defaultGuard = {
  deploy_at: new Date().toISOString(),
  activate_period: 30,
  activated_at: new Date().toISOString(),
  user_activate: null,
}

if (existsSync(guardPath)) {
  console.log('guard.json already exists, skipping...')
  process.exit(0)
}

writeFileSync(guardPath, JSON.stringify(defaultGuard, null, 2) + '\n')
console.log('guard.json created successfully!')
