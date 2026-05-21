#!/usr/bin/env node
/**
 * Cria/atualiza .env.local com DATABASE_URL e DIRECT_URL para Prisma + Supabase.
 *
 * Uso:
 *   SUPABASE_DB_PASSWORD=sua_senha npm run env:setup
 *   npm run env:setup   (pede a senha se não estiver no .env.local)
 *
 * Opcional:
 *   SUPABASE_DB_REGION=aws-1-sa-east-1
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envLocalPath = path.join(root, ".env.local");
const envExamplePath = path.join(root, ".env.example");

const DEFAULT_REGION = "aws-1-sa-east-1";

function parseEnvFile(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return { map, lines };
}

function serializeEnv(lines, updates) {
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      out.push(line);
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (updates.has(key)) {
      out.push(`${key}=${updates.get(key)}`);
      seen.add(key);
    } else {
      out.push(line);
    }
  }

  for (const [key, value] of updates) {
    if (!seen.has(key)) out.push(`${key}=${value}`);
  }

  return out.join("\n") + "\n";
}

function extractProjectRef(supabaseUrl) {
  if (!supabaseUrl) return null;
  try {
    const host = new URL(supabaseUrl).hostname;
    const ref = host.replace(".supabase.co", "");
    return ref || null;
  } catch {
    return null;
  }
}

function extractRegionFromDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return null;
  const match = databaseUrl.match(
    /@([a-z0-9]+-[a-z0-9-]+)\.pooler\.supabase\.com/i
  );
  return match?.[1] ?? null;
}

function extractPasswordFromDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return null;
  try {
    const normalized = databaseUrl.replace(
      /^postgresql:/,
      "postgres:"
    );
    const url = new URL(normalized);
    return url.password ? decodeURIComponent(url.password) : null;
  } catch {
    return null;
  }
}

function buildPrismaUrls({ projectRef, password, region }) {
  const user = `postgres.${projectRef}`;
  const encodedPassword = encodeURIComponent(password);
  const host = `${region}.pooler.supabase.com`;

  return {
    DATABASE_URL: `postgresql://${user}:${encodedPassword}@${host}:6543/postgres?pgbouncer=true`,
    DIRECT_URL: `postgresql://${user}:${encodedPassword}@${host}:5432/postgres`,
  };
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function resolvePassword(existingEnv) {
  if (process.env.SUPABASE_DB_PASSWORD) {
    return process.env.SUPABASE_DB_PASSWORD;
  }
  const fromUrl = extractPasswordFromDatabaseUrl(
    existingEnv.get("DATABASE_URL")
  );
  if (fromUrl && fromUrl !== "password") return fromUrl;

  if (!process.stdin.isTTY) {
    console.error(
      "Defina SUPABASE_DB_PASSWORD ou configure DATABASE_URL no .env.local."
    );
    process.exit(1);
  }

  return promptHidden(
    "Senha do banco Supabase (Settings → Database → password): "
  );
}

async function main() {
  let lines = [];
  const existing = new Map();

  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, "utf8");
    const parsed = parseEnvFile(content);
    for (const [k, v] of parsed.map) existing.set(k, v);
    lines = parsed.lines;
  } else if (fs.existsSync(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, "utf8");
    const parsed = parseEnvFile(content);
    for (const [k, v] of parsed.map) existing.set(k, v);
    lines = parsed.lines;
    console.log("Criando .env.local a partir de .env.example");
  } else {
    console.error("Arquivo .env.example não encontrado.");
    process.exit(1);
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    existing.get("NEXT_PUBLIC_SUPABASE_URL");
  const projectRef = extractProjectRef(supabaseUrl);

  if (!projectRef || projectRef === "your-project") {
    console.error(
      "Configure NEXT_PUBLIC_SUPABASE_URL no .env.local antes de rodar o setup."
    );
    process.exit(1);
  }

  const password = await resolvePassword(existing);
  if (!password) {
    console.error("Senha do banco não informada.");
    process.exit(1);
  }

  const region =
    process.env.SUPABASE_DB_REGION ||
    extractRegionFromDatabaseUrl(existing.get("DATABASE_URL")) ||
    DEFAULT_REGION;

  const prismaUrls = buildPrismaUrls({ projectRef, password, region });

  const updates = new Map([
    ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
    ["DATABASE_URL", prismaUrls.DATABASE_URL],
    ["DIRECT_URL", prismaUrls.DIRECT_URL],
  ]);

  if (!existing.has("NEXT_PUBLIC_APP_URL")) {
    updates.set("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  }
  if (!existing.has("NEXT_PUBLIC_APP_NAME")) {
    updates.set("NEXT_PUBLIC_APP_NAME", "ARQFLOW AI");
  }

  const output = serializeEnv(lines.length ? lines : [""], updates);
  fs.writeFileSync(envLocalPath, output, "utf8");

  console.log("");
  console.log(".env.local configurado para Prisma + Supabase");
  console.log(`  Projeto: ${projectRef}`);
  console.log(`  Região pooler: ${region}`);
  console.log("  DATABASE_URL → Transaction pooler (:6543, pgbouncer)");
  console.log("  DIRECT_URL   → Session pooler (:5432)");
  console.log("");
  console.log("Próximo passo: npm run db:push");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
