import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

// Test d'architecture : la règle de dépendance est vérifiée automatiquement à chaque build
function filesIn(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesIn(p) : p.endsWith(".ts") ? [p] : [];
  });
}

const SRC = path.join(__dirname, "..", "src");
const importsOf = (file: string) => [...fs.readFileSync(file, "utf-8").matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);

describe("règle de dépendance", () => {
  it("le domaine n'importe ni application, ni adapters, ni librairie technique", () => {
    for (const f of filesIn(path.join(SRC, "domain"))) {
      for (const imp of importsOf(f)) {
        expect(imp, `${f} importe ${imp}`).toMatch(/^\.\/|^\.\.\/(?!application|adapters)/);
        expect(imp).not.toMatch(/express|fs|crypto/);
      }
    }
  });

  it("l'application n'importe aucun adapter", () => {
    for (const f of filesIn(path.join(SRC, "application"))) {
      for (const imp of importsOf(f)) expect(imp, `${f} importe ${imp}`).not.toMatch(/adapters/);
    }
  });
});
