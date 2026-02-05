import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DOCS_SRC = path.join(ROOT, 'docs-src');
const APP_DIR = path.join(ROOT, 'app');
const PRESERVE = new Set(['layout.jsx']);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isMarkdownFile(name) {
  return name.endsWith('.md') || name.endsWith('.mdx');
}

function stripNumericPrefix(name) {
  return name.replace(/^\d+[._-]+/, '');
}

function toSlug(name) {
  const stripped = stripNumericPrefix(name);
  return stripped.length ? stripped : name;
}

function toTitleFromSlug(slug) {
  const cleaned = stripNumericPrefix(slug).replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return slug;
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractFrontmatterTitle(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const titleMatch = match[1].match(/^title:\s*(.+)\s*$/m);
  if (!titleMatch) return null;
  return titleMatch[1].replace(/^['"]|['"]$/g, '').trim();
}

function extractHeadingTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return null;
  return match[1].trim();
}

async function readTitleFromFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return extractFrontmatterTitle(content) || extractHeadingTitle(content) || null;
}

async function cleanAppDir() {
  const entries = await fs.readdir(APP_DIR, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      if (PRESERVE.has(entry.name)) return;
      const target = path.join(APP_DIR, entry.name);
      await fs.rm(target, { recursive: true, force: true });
    })
  );
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyDocFile(srcFile, destDir, slug) {
  const destFile = path.join(destDir, 'page.mdx');
  await ensureDir(destDir);
  const content = await fs.readFile(srcFile, 'utf8');
  await fs.writeFile(destFile, content, 'utf8');

  const title = (await readTitleFromFile(srcFile)) || toTitleFromSlug(slug);
  return { slug, title };
}

async function getDirTitle(srcDir, dirName) {
  const indexMd = path.join(srcDir, 'index.md');
  const indexMdx = path.join(srcDir, 'index.mdx');
  if (await exists(indexMd)) return (await readTitleFromFile(indexMd)) || toTitleFromSlug(dirName);
  if (await exists(indexMdx)) return (await readTitleFromFile(indexMdx)) || toTitleFromSlug(dirName);
  return toTitleFromSlug(dirName);
}

async function writeMeta(destDir, metaItems) {
  if (!Object.keys(metaItems).length) return;
  const metaPath = path.join(destDir, '_meta.json');
  const content = `${JSON.stringify(metaItems, null, 2)}\n`;
  await fs.writeFile(metaPath, content, 'utf8');
}

async function walkDocs(srcDir, destDir) {
  await ensureDir(destDir);

  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  const filtered = entries.filter((entry) => entry.isDirectory() || isMarkdownFile(entry.name));

  filtered.sort((a, b) => a.name.localeCompare(b.name));
  const indexPos = filtered.findIndex((entry) => entry.isFile() && /^index\.mdx?$/.test(entry.name));
  if (indexPos > 0) {
    filtered.unshift(filtered.splice(indexPos, 1)[0]);
  }

  const metaItems = {};

  for (const entry of filtered) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
    const slug = toSlug(entry.name);
    const destSubDir = path.join(destDir, slug);
    const dirTitle = await getDirTitle(srcPath, entry.name);
    metaItems[slug] = { title: dirTitle };
    await walkDocs(srcPath, destSubDir);
      continue;
    }

    if (!isMarkdownFile(entry.name)) continue;

    const rawSlug = entry.name.replace(/\.mdx?$/, '');
    const slug = rawSlug === 'index' ? rawSlug : toSlug(rawSlug);
    const isIndex = slug === 'index';
    const targetDir = isIndex ? destDir : path.join(destDir, slug);
    const { title } = await copyDocFile(srcPath, targetDir, rawSlug);
    metaItems[slug] = { title };
  }

  await writeMeta(destDir, metaItems);
}

async function main() {
  if (!(await exists(DOCS_SRC))) {
    console.error('docs-src/ not found.');
    process.exit(1);
  }

  await ensureDir(APP_DIR);
  await cleanAppDir();
  await walkDocs(DOCS_SRC, APP_DIR);
  console.log('Docs synced to app/.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
