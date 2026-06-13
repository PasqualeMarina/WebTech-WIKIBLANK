import { rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const databasePath = resolve(backendDir, 'data', 'wikblank.e2e.sqlite')

for (const suffix of ['', '-shm', '-wal']) {
  rmSync(`${databasePath}${suffix}`, { force: true })
}
