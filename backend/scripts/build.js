import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(backendDir, 'dist')
const schemaSource = resolve(backendDir, 'src', 'db', 'schema.sql')
const schemaDestination = resolve(
  distDir,
  'backend',
  'src',
  'db',
  'schema.sql',
)
const tscPath = resolve(backendDir, 'node_modules', 'typescript', 'bin', 'tsc')

rmSync(distDir, { recursive: true, force: true })

const result = spawnSync(process.execPath, [tscPath], {
  cwd: backendDir,
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

mkdirSync(dirname(schemaDestination), { recursive: true })
cpSync(schemaSource, schemaDestination)
