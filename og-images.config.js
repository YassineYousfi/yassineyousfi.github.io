import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { html, OG_SIZE } from "og-images-generator";

function font(name, family, environmentVariable) {
  const filename = process.env[environmentVariable] || execFileSync(
    "fc-match", ["--format=%{file}", `${family}:style=Bold`], { encoding: "utf8" },
  );
  return { name, data: readFileSync(filename), weight: 700, style: "normal" };
}

export const renderOptions = {
  satori: {
    ...OG_SIZE,
    fonts: [
      font("Site Serif", "Times New Roman", "OG_SERIF_FONT"),
      font("Site Sans", "Arial", "OG_SANS_FONT"),
    ],
  },
};

export const template = ({ page }) => {
  const title = page.meta.tags["og:title"];
  const family = page.path.startsWith("pages/slides/") ? "Site Sans" : "Site Serif";
  const fontSize = Math.min(88, Math.floor(88 * Math.sqrt(60 / title.length)));
  // The package decodes HTML before parsing it. Keep literal "<" from becoming markup.
  const text = title.replaceAll("<", "<\u200b");
  return html`
    <div style="display: flex; width: 100%; height: 100%; padding: 80px 96px;
                align-items: center; justify-content: center; background: #fff;">
      <div style="display: flex; justify-content: center; width: 100%;
                  color: #000; font-family: ${family};
                  font-weight: 700; font-size: ${fontSize}px; line-height: 1.15;
                  text-align: center; text-wrap: balance; word-break: break-word;">
        ${text}
      </div>
    </div>
  `;
};
