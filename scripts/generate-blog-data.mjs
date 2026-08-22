import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "src/content/blog");
const outputFile = path.join(
  process.cwd(),
  "src/data/generated-blog-sources.ts",
);

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInline(value) {
  const placeholders = [];
  const stash = (html) => {
    const token = `@@BLOGTOKEN${placeholders.length}@@`;
    placeholders.push(html);
    return token;
  };

  let rendered = value;

  rendered = rendered.replace(/`([^`]+)`/g, (_, code) =>
    stash(`<code>${escapeHtml(code)}</code>`),
  );

  rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    stash(
      `<a href="${escapeHtml(href.trim())}">${escapeHtml(label)}</a>`,
    ),
  );

  rendered = escapeHtml(rendered)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return rendered.replace(/@@BLOGTOKEN(\d+)@@/g, (_, index) =>
    placeholders[Number(index)] ?? "",
  );
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  const cells = splitTableRow(line);
  return (
    cells.length > 0 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function isTableStart(lines, index) {
  return (
    lines[index]?.trim().startsWith("|") &&
    lines[index + 1]?.trim().startsWith("|") &&
    isTableDivider(lines[index + 1])
  );
}

function isBlockStart(lines, index) {
  const line = lines[index]?.trim() ?? "";

  return (
    /^#{2,3}\s+/.test(line) ||
    /^<Callout(?:\s+title=(?:"[^"]*"|'[^']*'))?>$/.test(line) ||
    /^-\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    isTableStart(lines, index)
  );
}

function renderList(lines, startIndex, ordered) {
  const itemPattern = ordered ? /^\d+\.\s+(.*)$/ : /^-\s+(.*)$/;
  const items = [];
  let current = null;
  let index = startIndex;

  while (index < lines.length && lines[index].trim() !== "") {
    const line = lines[index].trim();
    const match = line.match(itemPattern);

    if (match) {
      if (current !== null) items.push(current);
      current = match[1];
      index += 1;
      continue;
    }

    if (current === null || isBlockStart(lines, index)) break;

    current += ` ${line}`;
    index += 1;
  }

  if (current !== null) items.push(current);

  const tag = ordered ? "ol" : "ul";
  const html = `<${tag}>${items
    .map((item) => `<li>${renderInline(item)}</li>`)
    .join("")}</${tag}>`;

  return { html, nextIndex: index };
}

function renderTable(lines, startIndex) {
  const headers = splitTableRow(lines[startIndex]);
  const divider = splitTableRow(lines[startIndex + 1]);
  const alignments = divider.map((cell) => {
    if (cell.startsWith(":" ) && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return "left";
  });

  const rows = [];
  let index = startIndex + 2;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  const headerHtml = headers
    .map(
      (cell, cellIndex) =>
        `<th style="text-align:${alignments[cellIndex] ?? "left"}">${renderInline(cell)}</th>`,
    )
    .join("");

  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell, cellIndex) =>
              `<td style="text-align:${alignments[cellIndex] ?? "left"}">${renderInline(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return {
    html: `<div data-blog-table-wrapper><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
    nextIndex: index,
  };
}

function renderBlocks(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    const callout = line.match(
      /^<Callout(?:\s+title=(?:"([^"]*)"|'([^']*)'))?>$/,
    );
    if (callout) {
      const title = callout[1] ?? callout[2] ?? "Worth knowing";
      const inner = [];
      index += 1;

      while (index < lines.length && lines[index].trim() !== "</Callout>") {
        inner.push(lines[index]);
        index += 1;
      }

      if (index >= lines.length) {
        throw new Error(`Unclosed Callout block titled "${title}".`);
      }

      blocks.push(
        `<aside data-blog-callout><p data-blog-callout-title>${renderInline(title)}</p><div data-blog-callout-body>${renderBlocks(inner.join("\n"))}</div></aside>`,
      );
      index += 1;
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = renderTable(lines, index);
      blocks.push(table.html);
      index = table.nextIndex;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const list = renderList(lines, index, false);
      blocks.push(list.html);
      index = list.nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const list = renderList(lines, index, true);
      blocks.push(list.html);
      index = list.nextIndex;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${renderBlocks(quote.join("\n"))}</blockquote>`);
      continue;
    }

    const paragraph = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !isBlockStart(lines, index)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

function requiredString(slug, data, key) {
  const value = data[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Blog post "${slug}" is missing required frontmatter field "${key}".`,
    );
  }

  return value;
}

const generatedBlogPosts = Object.fromEntries(
  fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".mdx"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
      const { data, content } = matter(raw);
      const words = content.trim().split(/\s+/).length;

      return [
        slug,
        {
          slug,
          title: requiredString(slug, data, "title"),
          date: String(data.date),
          excerpt: requiredString(slug, data, "excerpt"),
          category: requiredString(slug, data, "category"),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          relatedToolSlug: requiredString(slug, data, "relatedToolSlug"),
          readingTime: Math.max(1, Math.round(words / 200)),
          html: renderBlocks(content),
        },
      ];
    }),
);

const output = `// AUTO-GENERATED BY scripts/generate-blog-data.mjs\n// Blog MDX is parsed and rendered to safe HTML at build time.\n// Do not edit this file manually.\n\nexport const generatedBlogPosts = ${JSON.stringify(generatedBlogPosts, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, output, "utf-8");

console.log(
  `Generated ${Object.keys(generatedBlogPosts).length} build-time blog posts.`,
);
