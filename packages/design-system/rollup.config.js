import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';

const packageJson = require('./package.json');

export default {
  input: './index.ts',
  output: [
    {
      dir: './dist',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      preserveModules: true,
      preserveModulesRoot: './',
    },
  ],
  external: [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
    'tslib',
    'react/jsx-runtime',
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    svg(),
    postcss({ extract: true }),
    commonjs({
      exclude: 'src/**',
    }),
    ts({
      useTsconfigDeclarationDir: true,
      tsconfig: './tsconfig.json',
    }),
    babel({
      exclude: '/node_modules/',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      include: ['./**/*'],
      babelHelpers: 'bundled',
      presets: [['@babel/preset-react', { runtime: 'automatic' }]],
    }),
  ],
};
