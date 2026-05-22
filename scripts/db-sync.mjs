#!/usr/bin/env node
/**
 * Sincroniza enum SubscriptionPlan (STARTER → FREE) e aplica prisma db push.
 * Uso: npm run db:sync
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const withEnv = path.join(__dirname, "with-env-local.mjs");
const migDir = path.join(root, "prisma", "migrations", "20260520120000_plans_free_basic");

function run(args) {
  const result = spawnSync("node", [withEnv, ...args], {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("→ Adicionando valores FREE/BASIC ao enum...");
run([
  "npx",
  "prisma",
  "db",
  "execute",
  "--schema",
  "prisma/schema.prisma",
  "--file",
  path.join(migDir, "01_add_enum_values.sql"),
]);

console.log("→ Migrando assinaturas STARTER → FREE...");
run([
  "npx",
  "prisma",
  "db",
  "execute",
  "--schema",
  "prisma/schema.prisma",
  "--file",
  path.join(migDir, "02_migrate_starter.sql"),
]);

console.log("→ Aplicando schema Prisma (db push)...");
run(["npx", "prisma", "db", "push", "--accept-data-loss"]);

console.log("✓ Banco sincronizado com prisma/schema.prisma");
