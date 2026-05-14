#!/usr/bin/env node
// Mirrors every skills/<name>/SKILL.md to static/ so Docusaurus publishes them
// at the site root:
//   skills/greptimedb-quickstart/SKILL.md  -> static/SKILL.md
//                                         -> static/skills/greptimedb-quickstart/SKILL.md
//   skills/<other>/SKILL.md                 -> static/skills/<other>/SKILL.md
//
// The root /SKILL.md is the agent-onboarding entrypoint (copied from
// greptimedb-quickstart). The /skills/<name>/SKILL.md endpoints let agents
// fetch sister skills directly from the docs site instead of guessing GitHub
// paths.
//
// Runs as a prestart / prebuild npm hook. Never edit anything under
// static/SKILL.md or static/skills/ by hand.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = resolve(repoRoot, 'skills');
const staticDir = resolve(repoRoot, 'static');
const ROOT_SKILL = 'greptimedb-quickstart';

function bannerFor(srcRel) {
  return `<!-- Generated from ${srcRel}. Do not edit by hand. -->\n`;
}

function writeWithBanner(srcAbs, dstAbs, srcRel) {
  mkdirSync(dirname(dstAbs), { recursive: true });
  writeFileSync(dstAbs, bannerFor(srcRel) + readFileSync(srcAbs, 'utf8'), 'utf8');
  console.log(`[sync-skill] ${srcRel} -> ${dstAbs.slice(repoRoot.length + 1)}`);
}

for (const name of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const src = resolve(skillsDir, name.name, 'SKILL.md');
  const srcRel = `skills/${name.name}/SKILL.md`;
  try {
    readFileSync(src);
  } catch {
    continue;
  }
  writeWithBanner(src, resolve(staticDir, 'skills', name.name, 'SKILL.md'), srcRel);
  if (name.name === ROOT_SKILL) {
    writeWithBanner(src, resolve(staticDir, 'SKILL.md'), srcRel);
  }
}
