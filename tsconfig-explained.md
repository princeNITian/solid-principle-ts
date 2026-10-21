# TypeScript config explained

This note explains the important parts of the TypeScript config in this project.

## `sourceMap`

Creates a `.map` file next to the compiled JavaScript.

Example:

- `app.js`
- `app.js.map`

This helps debugging by mapping runtime code back to the original TypeScript source.

## `declaration`

Generates `.d.ts` files alongside the compiled output.

Example:

- `app.d.ts`

These files describe the public types of your code without including runtime logic. They are especially useful for libraries or packages that other code imports.

## `declarationMap`

Creates source maps for the generated declaration files.

Example:

- `app.d.ts.map`

This helps editors and tooling trace a type definition back to the original TypeScript file.

## `rootDir: "./src"`

Tells TypeScript that all source files live under the `src` folder.

## `outDir: "./dist"`

Tells TypeScript to write compiled output into the `dist` folder.

## `module: "nodenext"`

Uses Node's modern module rules. This is important for Node.js projects and affects how `import` and `export` statements are resolved.

## `target: "esnext"`

Compiles to the newest JavaScript syntax supported by the environment. This keeps modern JavaScript features rather than down-leveling too aggressively.

## `types: []`

This means: do not include any global type packages automatically.

For a Node.js project, this is often not the most convenient default because you may want Node globals like `process`, `Buffer`, and `__dirname` to be recognized automatically.

Typical Node.js setups often use:

```json
"types": ["node"]
```

or omit this setting entirely and let TypeScript include the default environment types.

## `strict: true`

Turns on strict type checking. This catches many common mistakes earlier and helps prevent runtime bugs.

## `verbatimModuleSyntax: true`

Preserves the module syntax you wrote more exactly, instead of rewriting it too aggressively.

## `isolatedModules: true`

Makes each file compile independently, which is useful for tooling like Babel and bundlers.

## `noUncheckedSideEffectImports: true`

Warns about imports that are only used for side effects and may be unnecessary or risky.

## `moduleDetection: "force"`

Ensures TypeScript treats files with imports/exports as modules even when it is not obvious from the file alone.

## `skipLibCheck: true`

Skips type checking for library declaration files from dependencies. This can speed up compilation.

## `noUncheckedIndexedAccess: true`

Makes indexed access safer by treating missing values as `undefined` in some cases.

## `exactOptionalPropertyTypes: true`

Makes optional object properties behave more precisely when they are set to `undefined`.

## Summary

This config is a modern, strict TypeScript setup for a Node.js project. It emphasizes:

- modern JavaScript output
- strict typing
- debugging support via source maps
- type declarations for packages or libraries
- safer code analysis

For most Node.js applications, using `"types": ["node"]` is usually more practical than an empty array unless you intentionally want full control over included types.
