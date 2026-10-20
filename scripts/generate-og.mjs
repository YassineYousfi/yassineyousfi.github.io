import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderOgImage } from "og-images-generator/api";
import { parse } from "parse5";
import * as ogConfig from "../og-images.config.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const siteUrl = new URL(process.env.SITE_URL || "https://yassineyousfi.github.io/");
const { width, height } = ogConfig.renderOptions.satori;
// pre-commit temporarily hides unstaged edits. Only consider files in Git's index.
const tracked = new Set(execFileSync("git", ["ls-files", "--cached", "-z"], {
  cwd: root, encoding: "utf8",
}).split("\0").filter(Boolean));
const pages = [...tracked].filter((filename) => filename.endsWith(".html")).sort();
let changed = false;
let untrackedImages = false;

async function writeIfChanged(filename, contents) {
  const data = Buffer.from(contents);
  const previous = await readFile(filename).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  if (!previous?.equals(data)) {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, data);
    changed = true;
    console.log(`Updated ${path.relative(root, filename)}`);
  }
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function addMetadata(html, title, pagePath, imagePath, hash) {
  const imageUrl = new URL(imagePath, siteUrl);
  imageUrl.searchParams.set("v", hash);
  const tags = [
    ["property", "og:type", "website"],
    ["property", "og:title", title],
    ["property", "og:url", new URL(pagePath.replace(/(^|\/)index\.html$/, "$1"), siteUrl).href],
    ["property", "og:image", imageUrl],
    ["property", "og:image:type", "image/png"],
    ["property", "og:image:width", width],
    ["property", "og:image:height", height],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:image", imageUrl],
  ].map(([attribute, name, value]) =>
    `  <meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`
  ).join("\n");
  if (!/<\/head\s*>/i.test(html)) throw new Error(`Missing </head>: ${pagePath}`);
  return html
    .replace(/[ \t]*<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:|twitter:)[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<\/head\s*>/i, `${tags}\n</head>`);
}

for (const pagePath of pages) {
  const filename = path.join(root, pagePath);
  const source = await readFile(filename, "utf8");
  const document = parse(source).childNodes.find((node) => node.tagName === "html");
  const head = document.childNodes.find((node) => node.tagName === "head");
  const titleNode = head.childNodes.find((node) => node.tagName === "title");
  const title = titleNode?.childNodes.map((node) => node.value || "").join("").replace(/\s+/g, " ").trim();
  if (!title) throw new Error(`Missing <title>: ${pagePath}`);
  const image = await renderOgImage(ogConfig, {
    path: pagePath,
    meta: { tags: { "og:title": title } },
  });
  const hash = createHash("sha256").update(image).digest("hex").slice(0, 12);
  const imagePath = `assets/og/${pagePath.replace(/\.html$/, "")}.png`;
  await writeIfChanged(path.join(root, imagePath), image);
  await writeIfChanged(filename, addMetadata(source, title, pagePath, imagePath, hash));
  untrackedImages ||= !tracked.has(imagePath);
}
if (process.env.PRE_COMMIT && (changed || untrackedImages)) {
  console.error("Stage the updated HTML and assets/og/ images, then retry the commit.");
  process.exitCode = 1;
} else {
  console.log(`Checked previews for ${pages.length} pages.`);
}
