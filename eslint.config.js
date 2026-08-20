import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  {
    ignores: [
      'dist/**',
      'studio/dist/**',
      'studio/.sanity/**',
      '.astro/**',
      'node_modules/**',
      'output/**',
    ],
  },
  ...eslintPluginAstro.configs['flat/recommended'],
];
