/** @param {string[]} filenames */
function eslintCmd(configPath, filenames) {
  return `eslint --fix --config ${configPath} ${filenames.map((f) => `"${f}"`).join(' ')}`;
}

module.exports = {
  'apps/web/**/*.{ts,tsx,js,jsx}': [
    (filenames) => eslintCmd('apps/web/eslint.config.mjs', filenames),
    'prettier --write',
  ],
  'packages/shared-types/**/*.{ts,tsx,js,jsx}': [
    (filenames) => eslintCmd('packages/shared-types/eslint.config.mjs', filenames),
    'prettier --write',
  ],
  '*.{ts,tsx,js,jsx}': ['prettier --write'],
  '*.{json,md,mdc,yml,yaml}': ['prettier --write'],
};
