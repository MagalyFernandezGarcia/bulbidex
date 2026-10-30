import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const nextDefaultExportFiles = [
  "src/app/**/{page,layout,template,default,loading,error,global-error,not-found,forbidden,unauthorized}.tsx",
  "src/app/**/{opengraph-image,twitter-image,icon,apple-icon}.tsx",
  "src/app/**/{sitemap,robots,manifest}.ts",
  "*.config.{ts,mjs}",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,mts}"],
    ignores: ["src/components/ui/**"],
    rules: {
      "prefer-arrow-callback": "error",
      "func-style": ["error", "expression"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message:
            "Use an arrow function (`const foo = () => {}`) instead of the `function` keyword.",
        },
        {
          selector: "FunctionExpression:not(MethodDefinition > FunctionExpression)",
          message:
            "Use an arrow function (`const foo = () => {}`) instead of the `function` keyword.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)!\\S|\\S!(\\s|$)/]",
          message:
            "Avoid `!important` modifiers in className — refactor the style hierarchy instead.",
        },
        {
          selector: "CallExpression[callee.property.name='nonempty']",
          message: "`.nonempty()` is deprecated — use `.min(1, 'key')` instead.",
        },
        {
          selector:
            "CallExpression[callee.property.name='email'][callee.object.callee.property.name='string']",
          message: "`z.string().email()` is deprecated — use `z.email()` instead.",
        },
        {
          selector: "MemberExpression[property.name=/^\\$(queryRaw|executeRaw)(Unsafe)?$/]",
          message: "Never write raw SQL — use the Prisma client API instead.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["default"],
              message:
                "Import only the members you need (e.g. `import { ReactNode } from 'react'`).",
            },
          ],
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "import/no-default-export": "error",
    },
  },
  {
    files: nextDefaultExportFiles,
    rules: {
      "import/no-default-export": "off",
    },
  },
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"]),
]);

export default eslintConfig;
