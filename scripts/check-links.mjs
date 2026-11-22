// Base-path link check for the built site (Review Focus 1, D-004).
// Scans every *.html under distDir and verifies each internal href/src:
// root-relative values must carry the base path and resolve to a file in distDir.
// Node built-ins only.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {{ file: string; attr: 'href' | 'src'; value: string; reason: 'missing-base' | 'not-found' }} LinkError
 */

const ATTR_RE = /\s(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const COMMENT_RE = /<!--[\s\S]*?-->/g;
// Keeps the opening <script ...> tag (so a src attribute is still checked), drops the body.
const SCRIPT_BODY_RE = /(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi;

/**
 * Remove HTML comments and inline script bodies so code like `el.src = x`
 * is not mistaken for an attribute.
 * @param {string} html
 */
function stripNonMarkup(html) {
  return html.replace(COMMENT_RE, '').replace(SCRIPT_BODY_RE, '$1</script>');
}

/** @param {string} dir @returns {Promise<string[]>} */
async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.html'))
    .map((e) => path.join(e.parentPath, e.name))
    .sort();
}

/** @param {string} value */
function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** @param {string} p @returns {Promise<boolean>} */
async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

/**
 * True if urlPath (already stripped of base, query and fragment) maps to a
 * file inside root, either directly or as index.html of a directory.
 * @param {string} root absolute dist directory
 * @param {string} fromDir absolute directory the path is relative to
 * @param {string} urlPath
 */
async function resolves(root, fromDir, urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return false;
  }
  const target = path.resolve(fromDir, decoded);
  const rel = path.relative(root, target);
  // Never follow a link outside distDir.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
  if (await isFile(target)) return true;
  return isFile(path.join(target, 'index.html'));
}

/** @param {string} value */
function stripQueryAndFragment(value) {
  const cut = value.search(/[?#]/);
  return cut === -1 ? value : value.slice(0, cut);
}

/**
 * @param {string} distDir
 * @param {string} base e.g. '/tuan-blog'
 * @returns {Promise<LinkError[]>}
 */
export async function checkLinks(distDir, base) {
  const root = path.resolve(distDir);
  const prefix = `${base.replace(/\/+$/, '')}/`;
  /** @type {LinkError[]} */
  const errors = [];

  for (const filePath of await listHtml(root)) {
    const html = stripNonMarkup(await readFile(filePath, 'utf8'));
    const file = path.relative(root, filePath).split(path.sep).join('/');
    const fileDir = path.dirname(filePath);

    for (const m of html.matchAll(ATTR_RE)) {
      const attr = /** @type {'href' | 'src'} */ (m[1].toLowerCase());
      const value = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '').trim();

      if (value === '' || value.startsWith('#')) continue;
      if (value.startsWith('//') || SCHEME_RE.test(value)) continue;

      if (value.startsWith('/')) {
        if (!value.startsWith(prefix)) {
          errors.push({ file, attr, value, reason: 'missing-base' });
          continue;
        }
        const rest = stripQueryAndFragment(value.slice(prefix.length));
        if (!(await resolves(root, root, rest))) {
          errors.push({ file, attr, value, reason: 'not-found' });
        }
        continue;
      }

      const rest = stripQueryAndFragment(value);
      if (!(await resolves(root, fileDir, rest))) {
        errors.push({ file, attr, value, reason: 'not-found' });
      }
    }
  }
  return errors;
}

async function main() {
  const [distDir, base] = process.argv.slice(2);
  if (!distDir || base === undefined) {
    process.stderr.write(
      'usage: node scripts/check-links.mjs <distDir> <base>\n',
    );
    process.exit(2);
  }
  const errors = await checkLinks(distDir, base);
  for (const e of errors) {
    process.stdout.write(`${e.file}: ${e.attr}="${e.value}" ${e.reason}\n`);
  }
  if (errors.length > 0) process.exit(1);
  process.stdout.write('links: ok\n');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    process.stderr.write(
      `check-links: ${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  });
}
