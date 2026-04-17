import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");

function readPreset(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(ROOT, name), "utf8")) as Record<string, unknown>;
}

function listPresets(prefix: string): string[] {
  return readdirSync(ROOT)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
}

describe("recipes are pure extends arrays", () => {
  const recipes = listPresets("recipe-");

  test("there is at least one recipe", () => {
    expect(recipes.length).toBeGreaterThan(0);
  });

  for (const recipe of recipes) {
    test(`${recipe} has no compilerOptions`, () => {
      const content = readPreset(recipe);
      expect(content).not.toHaveProperty("compilerOptions");
    });

    test(`${recipe} has an extends array`, () => {
      const content = readPreset(recipe);
      expect(Array.isArray(content["extends"])).toBe(true);
    });

    test(`${recipe} only has allowed top-level keys`, () => {
      const content = readPreset(recipe);
      const allowed = new Set(["$schema", "display", "extends"]);
      const keys = Object.keys(content);
      for (const key of keys) {
        expect(allowed.has(key)).toBe(true);
      }
    });
  }
});

describe("atoms stay within their dimension", () => {
  const RUNTIME_KEYS = new Set(["types", "lib"]);
  const BUILD_KEYS = new Set(["module", "moduleResolution", "noEmit", "outDir"]);
  const PROJECT_KEYS = new Set([
    "declaration",
    "isolatedDeclarations",
    "allowJs",
    "noPropertyAccessFromIndexSignature",
  ]);
  const FRAMEWORK_ALLOWED: Record<string, Set<string>> = {
    "framework-react.json": new Set(["jsx"]),
    "framework-nestjs.json": new Set([
      "experimentalDecorators",
      "emitDecoratorMetadata",
      "strictPropertyInitialization",
    ]),
    "framework-vitest.json": new Set(["types", "noUnusedLocals", "noUnusedParameters"]),
  };

  function optionsOf(file: string): Record<string, unknown> {
    return (readPreset(file)["compilerOptions"] ?? {}) as Record<string, unknown>;
  }

  function assertKeysWithin(file: string, allowed: Set<string>) {
    const keys = Object.keys(optionsOf(file));
    for (const key of keys) {
      expect(allowed.has(key)).toBe(true);
    }
  }

  for (const file of listPresets("runtime-")) {
    test(`${file} only touches runtime fields`, () => {
      assertKeysWithin(file, RUNTIME_KEYS);
    });
  }

  for (const file of listPresets("build-")) {
    test(`${file} only touches build fields`, () => {
      assertKeysWithin(file, BUILD_KEYS);
    });
  }

  for (const file of listPresets("project-")) {
    test(`${file} only touches project fields`, () => {
      assertKeysWithin(file, PROJECT_KEYS);
    });
  }

  for (const [file, allowed] of Object.entries(FRAMEWORK_ALLOWED)) {
    test(`${file} only touches its framework fields`, () => {
      assertKeysWithin(file, allowed);
    });
  }
});
