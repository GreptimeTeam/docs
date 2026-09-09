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

/** Top-level routes that are not documentation pages of the root version. */
const NON_DOC_SEGMENTS = ['release-notes', 'search', 'nightly'];

function isUnderSegment(routePath: string, segment: string): boolean {
  return routePath === `/${segment}` || routePath.startsWith(`/${segment}/`);
}

/**
 * Maps a route of the root version to its `/<lastVersion>/` alias.
 *
 * The version served at the root has no version prefix, so a URL written with
 * an explicit version number (`/1.2/user-guide/overview`) does not resolve.
 * The alias is a client-side redirect back to the root path, keeping one
 * canonical URL per page. When the next version is promoted to the root, the
 * previous number stops being aliased and becomes a real prefixed version.
 *
 * @param routePath a route emitted by the build, with a leading slash
 * @param lastVersion the version served at the site root
 * @param otherVersions every version served under a `/<version>/` prefix
 * @returns the alias path, or null when the route is not a root-version doc
 */
export function stableVersionAliasPath(
  routePath: string,
  lastVersion: string,
  otherVersions: string[],
): string | null {
  if (routePath === '/404.html') {
    return null;
  }
  const excluded = [...NON_DOC_SEGMENTS, ...otherVersions];
  if (excluded.some((segment) => isUnderSegment(routePath, segment))) {
    return null;
  }
  return `/${lastVersion}${routePath}`;
}
