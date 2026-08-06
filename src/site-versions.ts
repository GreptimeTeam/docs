/**
 * Resolves which documentation version is served at the site root.
 *
 * The newest entry in versions.json is not always the right default: a doc
 * version is cut before its GreptimeDB release reaches GA (1.2 was branched
 * while GreptimeDB was still at v1.2.0-beta.1). Serving a pre-release at the
 * root would make it the version users land on and the one Google indexes.
 *
 * `variables/variables-<version>.ts` already records the release each doc
 * version describes and is maintained by the "Bump Patch Version" workflow, so
 * it is used as the source of truth here: the root version is the newest one
 * pointing at a stable release. Bumping that file to a GA version promotes the
 * doc version automatically, with no config change.
 */
import * as fs from 'fs';
import * as path from 'path';

const PRE_RELEASE = /-(?:alpha|beta|rc|nightly)/i;

function greptimedbVersionOf(version: string, rootDir: string): string | null {
  const filePath = path.resolve(rootDir, 'variables', `variables-${version}.ts`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const match = fs
    .readFileSync(filePath, 'utf-8')
    .match(/greptimedbVersion:\s*['"]([^'"]*)['"]/);
  return match ? match[1] : null;
}

/**
 * @param versions contents of versions.json, newest first
 * @returns the newest version describing a stable release, falling back to the
 *   newest version when none qualifies
 */
export function resolveLastVersion(
  versions: string[],
  rootDir: string = process.cwd(),
): string {
  const stable = versions.find((version) => {
    const greptimedbVersion = greptimedbVersionOf(version, rootDir);
    return greptimedbVersion !== null && !PRE_RELEASE.test(greptimedbVersion);
  });
  return stable ?? versions[0];
}
