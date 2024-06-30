import fs from 'node:fs'
import path from 'node:path'
import { build } from 'vite'
import {
  beforeAll,
  expect,
  test,
} from 'vitest'

const root = path.join(__dirname, 'fixtures')

beforeAll(async () => {
  await build({ configFile: path.join(root, 'vite.config.ts') })
})

test('vite-plugin-webpack-prebundle', async () => {
  const main = require('./fixtures/dist/main')
  const fileType = main.fileType
  const sqlite3 = main.sqlite3
  const sqlite3DB = await main.initSqlite3()

  for (const key of [
    'fileTypeFromBlob',
    'fileTypeFromBuffer',
    'fileTypeFromFile',
    'fileTypeFromStream',
    'fileTypeFromTokenizer',
    'fileTypeStream',
  ]) {
    expect(fileType[key] && typeof fileType[key]).eq('function')
  }

  const sqlite3Keys1 = Object.getOwnPropertyNames(sqlite3).filter(name => name !== 'default')
  // `require('sqlite3').path` will only be available after call `initSqlite3()`.
  const sqlite3Keys2 = Object.getOwnPropertyNames(require('sqlite3')).filter(name => name !== 'path')
  expect(sqlite3Keys1).toEqual(sqlite3Keys2)
  expect(sqlite3DB.database && typeof sqlite3DB.database).eq('object')
  expect(sqlite3DB.error).null
})
