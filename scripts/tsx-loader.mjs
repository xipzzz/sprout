// Node loader for exam tests that render .tsx: transpiles TS/TSX with the
// project's TypeScript, stubs CSS imports, and resolves extensionless imports.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.css') && context.parentURL) {
    return { url: new URL(specifier, context.parentURL).href, shortCircuit: true };
  }
  if (specifier.startsWith('.') && context.parentURL && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    for (const ext of ['.ts', '.tsx']) {
      const url = new URL(specifier + ext, context.parentURL);
      if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
    }
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url.endsWith('.css')) return { format: 'module', source: 'export {};', shortCircuit: true };
  if (url.startsWith('file:') && /\.tsx?$/.test(url)) {
    const fileName = fileURLToPath(url);
    const { outputText } = ts.transpileModule(await readFile(fileName, 'utf8'), {
      fileName,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        verbatimModuleSyntax: true,
      },
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  }
  return next(url, context);
}
