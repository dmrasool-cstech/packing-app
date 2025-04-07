import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/no-unescaped-entities": "off", // Disable unescaped entities warning
      "react-hooks/exhaustive-deps": "off", // Disable exhaustive dependencies warning
      "react-hooks/rules-of-hooks": "error", // Ensure hooks follow React rules
    },
  },
];

export default eslintConfig;
