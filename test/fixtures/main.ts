import path from 'node:path'

import * as fileType from 'file-type'
import sqlite3 from 'sqlite3'

export {
  fileType,
  sqlite3,
}

const root = path.join(__dirname, '..')

export function initSqlite3() {
  const sqlite3_db = path.join(root, 'dist/sqlite3.db')

  return new Promise<{
    database: import('sqlite3').Database
    error: Error | null
  }>(resolve => {
    const db = new (sqlite3.verbose().Database)(sqlite3_db, error => {
      resolve({
        database: db,
        error,
      })
    })
  })
}

/* TODO: express
export function initExpress() {
  return new Promise<{
    app: ReturnType<typeof import('express')>
    error: Error | null
  }>(resolve => {
    const app = express()

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    app.get('/', function (req, res) {
      res.send('Hello World')
    })

    app.listen(3333, () => {
      resolve({
        app,
        error: null,
      })
    })
  })
}
*/
