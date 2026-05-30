import nextjsConfig from '@uk-phv/config-eslint/nextjs';

export default [
  ...nextjsConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
