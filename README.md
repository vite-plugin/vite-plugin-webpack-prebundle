# vite-plugin-webpack-prebundle

A Webpack-based pre-bundle solution, mainly used for adapting Node.js and Electron.

[![NPM version](https://img.shields.io/npm/v/vite-plugin-webpack-prebundle.svg)](https://npmjs.org/package/vite-plugin-webpack-prebundle)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-webpack-prebundle.svg)](https://npmjs.org/package/vite-plugin-webpack-prebundle)

English | [简体中文](./README.zh-CN.md)

## Install

```bash
npm i -D vite-plugin-webpack-prebundle
```

## Usage

```js
import prebundle from 'vite-plugin-webpack-prebundle'

export default {
  plugins: [
    prebundle({
      modules: [
        'foo',
        'bar',
      ],
    })
  ]
}
```

## API

```ts
export interface PrebundleOptions {
  /** An array of module names that need to be pre-bundle. */
  modules: string[]
  config?: (config: Configuration) => Configuration | undefined | Promise<Configuration | undefined>
}
```

## Why

This is a Pre-Bundle solution designed for Node/Electron Apps, which is consistent with Vite's built-in [Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html#dependency-pre-bundling) behavior. The reason for using Webpack is that it's currently the most compatible bundler for Node/Electron Apps.

## Compare

<table>
  <thead>
    <th>Pre-Bundle solution</th>
    <th>Web</th>
    <th>Node/Electron</th>
  </thead>
  <tbody>
    <tr>
      <td>Vite's built-in Dependency Pre-Bundling</td>
      <td>✅</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>vite-plugin-webpack-prebundle</td>
      <td>✅</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>
