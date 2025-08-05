const { defineConfig, globalIgnores } = require("eslint/config");

const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
  },
  globalIgnores(["**/dist/", "*.config.js"]),
]);
