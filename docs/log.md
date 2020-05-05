# Log

#### 2020-03-28 00:27:02 业务和时代变化， 重新思考打包工具的应用场景和方式

- weboack

  - target 为 web 适为 [browser, module, main]
  - target 为 node 适为 [module, main]

- cjs

  - 转换方式
    - rollup 单文件
    - babel 多文件 TODO： 思考多文件应用场景

- esm

  - 转换方式
    - rollup 单文件
    - babel 多文件 如果有 treeShaking 情况下是否需要多文件

- umd
  - 转换方式
    - rollup 单文件

#### 2020-03-28 15:00:37 rollup

#### 2020-03-31 11:09:55 rollup plugin external 在 yarn link 之后 requireresolve 有问题， 待解决

#### 2020-03-31 13:45:14 for type DECLARATION

|--dist
|----index.mjs
|----index.cjs.js
|----index.esm.js
|----index.umd.js
|----index.umd.min.js
|----index.d.ts
|----\*\*.d.ts

|--lib (cjs)
|----{{name}}.js
|--es (esm,mjs)
|----{{name}}.js
|----{{name}}.mjs
|--dist (umd)
|----{{name}}.js
|----{{name}}.min.js
|--types (.d)
|----index.d.ts
|----\*\*.d.ts

2020-03-31 14:18:36 输出方式确认第一种 (for easy);

#### 2020-05-03 21:32:09 拆分 docz
