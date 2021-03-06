import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import buble from 'rollup-plugin-buble';

const src = path.resolve('src');

export default [
	/* compiler/svelte.js */
	{
		entry: 'src/index.ts',
		dest: 'compiler/svelte.js',
		format: 'umd',
		moduleName: 'svelte',
		plugins: [
			{
				resolveId(importee, importer) {
					// bit of a hack — TypeScript only really works if it can resolve imports,
					// but they misguidedly chose to reject imports with file extensions. This
					// means we need to resolve them here
					if (
						importer &&
						importer.startsWith(src) &&
						importee[0] === '.' &&
						path.extname(importee) === ''
					) {
						return path.resolve(path.dirname(importer), `${importee}.ts`);
					}
				}
			},
			nodeResolve({ jsnext: true, module: true }),
			commonjs(),
			json(),
			typescript({
				include: 'src/**',
				exclude: 'src/shared/**',
				typescript: require('typescript')
			})
		],
		sourceMap: true
	},

	/* ssr/register.js */
	{
		entry: 'src/server-side-rendering/register.js',
		dest: 'ssr/register.js',
		format: 'cjs',
		plugins: [
			nodeResolve({ jsnext: true, module: true }),
			commonjs(),
			buble({
				include: 'src/**',
				exclude: 'src/shared/**',
				target: {
					node: 4
				}
			})
		],
		external: [path.resolve('src/index.ts'), 'fs', 'path'],
		paths: {
			[path.resolve('src/index.ts')]: '../compiler/svelte.js'
		},
		sourceMap: true
	},

	/* shared.js */
	{
		entry: 'src/shared/index.js',
		dest: 'shared.js',
		format: 'es'
	}
];
