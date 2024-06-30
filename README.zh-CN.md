# vite-plugin-webpack-prebundle

一个基于 Webpack 的预构建(pre-bundle) 方案, 主要用于适配 Node.js 和 Electron。

[![NPM version](https://img.shields.io/npm/v/vite-plugin-webpack-prebundle.svg)](https://npmjs.org/package/vite-plugin-webpack-prebundle)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-webpack-prebundle.svg)](https://npmjs.org/package/vite-plugin-webpack-prebundle)

[English](./README.md) | 简体中文

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

这是一个专为 Node/Electron 应用而生的 Pre-Bundling 方案，与 Vite 内置的 [Dependency Pre-Bundling](https://vitejs.dev/guide/dep-pre-bundling.html#dependency-pre-bundling) 行为一致。使用 Webpack 的原因是对于 Node/Electron 应用来说，它是目前兼容性最好的 Bundler。

## 对比

<table>
  <thead>
    <th>Pre-Bundle solution</th>
    <th>Web</th>
    <th>Node/Electron</th>
  </thead>
  <tbody>
    <tr>
      <td>Vite 内置的 Dependency Pre-Bundling</td>
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
