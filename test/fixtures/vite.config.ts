process.env.NODE_ENV = 'test'

import fs from 'node:fs'
import path from 'node:path'
import { builtinModules } from 'node:module'
import { defineConfig } from 'vite'
import prebundle from '../..'

fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true })

export default defineConfig({
  root: __dirname,
  build: {
    minify: false,
    emptyOutDir: false,
    lib: {
      entry: 'main.ts',
      formats: ['cjs'],
      fileName: () => '[name].js',
    },
    rollupOptions: {
      external: [
        'vite',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
    },
  },
  plugins: [
    prebundle({
      modules: [
        'file-type',
        'sqlite3',
      ],
      config(config) {
        config.module ??= {}
        config.module.rules ??= []
        config.module.rules.push(
          {
            test: /native_modules[/\\].+\.node$/,
            use: 'node-loader',
          },
          {
            test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
            parser: { amd: false },
            use: {
              loader: '@vercel/webpack-asset-relocator-loader',
              options: {
                outputAssetBase: 'native_modules',
              },
            },
          },
        )

        return config
      },
    }),
  ],
})
