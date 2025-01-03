import globals from "globals";
import pluginJs from "@eslint/js";
import { parse } from "dotenv";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "module"}},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    rules:{
      // "@typescript-eslint/no-restricted-syntax": "off",
      // "no-restricted-syntax": "off"
    },
  }
];