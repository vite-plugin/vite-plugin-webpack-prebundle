import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import _libEsm from 'lib-esm'

// @ts-ignore
const libEsm: typeof import('lib-esm').default = _libEsm.default || _libEsm
const cjs = createCjs(import.meta.url)

export function createCjs(url = import.meta.url) {
  const cjs__filename = typeof __filename === 'undefined'
    ? fileURLToPath(url)
    : __filename
  const cjs__dirname = path.dirname(cjs__filename)
  const cjsRequire = typeof require === 'undefined'
    ? createRequire(url)
    : require

  return {
    __filename: cjs__filename,
    __dirname: cjs__dirname,
    require: cjsRequire,
  }
}

export function cjs2esm(id: string, code: string) {
  const snippet = libEsm({
    exports: Object.getOwnPropertyNames(cjs.require(id)),
  })
  const commentsStart = '/* [webpack-prebundle]: start */'
  const commentsEnd = '/* [webpack-prebundle]: end */'
  const sourcemapURL = '//# sourceMappingURL='
  const esmStart = [commentsStart, 'const module = { exports: {} };', commentsEnd].join('')
  const esmEnd = [
    commentsStart,
    'const _M_ = module.exports;',
    snippet.exports,
    commentsEnd,
  ].join('\n')

  code = esmStart + code
  const lines = code.split('\n')
  let lastLine = lines[lines.length - 1]

  if (lastLine.startsWith(sourcemapURL)) {
    lines[lines.length - 1] = `${esmEnd}\n${lastLine}`
    code = lines.join('\n')
  } else {
    code = `${code}\n${esmEnd}`
  }

  // TODO: generate sourcemap for esm wrap-snippet
  return code
}
