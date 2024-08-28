import fs from 'node:fs'
import path from 'node:path'
import {
  type Plugin,
  type UserConfig,
  normalizePath,
} from 'vite'
import type { Configuration } from 'webpack'
import { COLOURS } from 'vite-plugin-utils/function'
import {
  createCjs,
  cjs2esm,
} from './utils'

export interface BundledRecord {
  name: string
  code: string
  filename: string
}

export interface PrebundleOptions {
  /** An array of module names that need to be pre-bundle. */
  modules: string[]
  config?: (config: Configuration) => Configuration | undefined | Promise<Configuration | undefined>
}

const cjs = createCjs(import.meta.url)
const TAG = '[vite-plugin-webpack-prebundle]'
// `nativesMap` is placed in the global scope and can be effective for multiple builds.
const bundledMap = new Map<string, BundledRecord>
const IDPrefix = '\0webpack-prebundle'
let output: string

export default function native(options: PrebundleOptions): Plugin {
  return {
    name: 'vite-plugin-webpack-prebundle',
    enforce: 'pre',
    configResolved(config) {
      // Use the `build.outDir` for those C/C++ addons assets.
      output = normalizePath(path.join(config.root, config.build.outDir))
    },
    async resolveId(source) {
      if (options.modules.includes(source)) {
        const bundled = bundledMap.get(source)
        if (!bundled) {
          try {
            await webpackBundle(source, output, options.config)
            const filename = path.posix.join(output, source + '.js')
            const code = cjs2esm(
              // After bundle, it must be a cjs module.
              filename,
              fs.readFileSync(filename, 'utf8'),
            )

            fs.writeFileSync(filename, code)
            bundledMap.set(source, {
              name: source,
              code,
              filename,
            })
          } catch (error: any) {
            console.error(`\n${TAG}`, error)
            process.exit(1)
          }
        }

        return IDPrefix + source
      }
    },
    load(id) {
      if (id.startsWith(IDPrefix)) {
        const name = id.replace(IDPrefix, '')
        const bundled = bundledMap.get(name)
        if (bundled) {
          return bundled.code
        }
      }
    },
    closeBundle() {
      if (!(process.env.DEBUG || process.env.NODE_ENV === 'test')) {
        for (const [, bundled] of bundledMap) {
          // Remove unused bundle files
          fs.unlinkSync(bundled.filename)
          fs.unlinkSync(bundled.filename + '.map')
        }
      }
    },
    async config(config) {
      // Not necessary, since bundle.js is wrapped in an immediately executed closure.
      modifyCommonjs(config, options.modules)
      // Not necessary, since Pre-Bundling is disabled by default in `vite build` command.
      modifyOptimizeDeps(config, options.modules)
    },
  }
}

function modifyCommonjs(config: UserConfig, modules: string[]) {
  config.build ??= {}
  config.build.commonjsOptions ??= {}
  if (config.build.commonjsOptions.ignore) {
    if (typeof config.build.commonjsOptions.ignore === 'function') {
      const userIgnore = config.build.commonjsOptions.ignore
      config.build.commonjsOptions.ignore = id => {
        if (userIgnore?.(id) === true) {
          return true
        }
        return modules.includes(id)
      }
    } else {
      // @ts-ignore
      config.build.commonjsOptions.ignore.push(...modules)
    }
  } else {
    config.build.commonjsOptions.ignore = modules
  }
}

function modifyOptimizeDeps(config: UserConfig, exclude: string[]) {
  config.optimizeDeps ??= {}
  config.optimizeDeps.exclude ??= []
  for (const str of exclude) {
    if (!config.optimizeDeps.exclude.includes(str)) {
      // Avoid Vite secondary pre-bundle
      config.optimizeDeps.exclude.push(str)
    }
  }
}

async function webpackBundle(
  name: string,
  output: string,
  webpackConfig: PrebundleOptions['config']
) {
  const { validate, webpack } = cjs.require('webpack') as typeof import('webpack')

  return new Promise<null>(async (resolve, reject) => {
    let options: Configuration = {
      mode: 'none',
      target: 'node14',
      entry: { [name]: name },
      output: {
        library: {
          type: 'commonjs2',
        },
        path: output,
        filename: '[name].js',
      },
      module: {
        rules: [
          // TODO: Add some commonly used loaders.
        ],
      },
      devtool: 'source-map',
    }

    if (webpackConfig) {
      options = await webpackConfig(options) ?? options
    }

    try {
      validate(options)
    } catch (error: any) {
      reject(COLOURS.red(error.message))
      return
    }

    webpack(options).run((error, stats) => {
      if (error) {
        reject(error)
        return
      }

      if (stats?.hasErrors()) {
        const errorMsg = stats.toJson().errors?.map(msg => msg.message).join('\n')

        if (errorMsg) {
          reject(COLOURS.red(errorMsg))
          return
        }
      }

      console.log(`${TAG}`, name, COLOURS.green('build success'))
      resolve(null)
    })
  })
}
