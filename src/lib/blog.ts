import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Blog data layer — server-only (uses Node's fs, never imported into
 * client components). Content-as-code: every article is one .mdx file
 * in src/content/blog/.
 */

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  /** The traffic flywheel — every article links to one calculator. */
  relatedToolSlug: string;
  readingTime: number;
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");

/** Strict frontmatter parsing — fails loudly at build time, never at runtime. */
function parseFrontmatter(slug: string, data: Record<string, unknown>): Omit<BlogPost, "slug" | "readingTime"> {
  const str = (key: string) => {
    const value = data[key];
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(`Blog post "${slug}" is missing required frontmatter field "${key}".`);
    }
    return value;
  };

  return {
    title: str("title"),
    date: String(data.date),
    excerpt: str("excerpt"),
    category: str("category"),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    relatedToolSlug: str("relatedToolSlug"),
  };
}

function readPost(slug: string): BlogPostWithContent {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.mdx`), "utf-8");
  const { data, content } = matter(raw);

  // Reading time: word count / 200 wpm, minimum one minute.
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  return {
    slug,
    ...parseFrontmatter(slug, data),
    readingTime,
    content,
  };
}

/** All posts, newest first. */
export function getPosts(): BlogPostWithContent[] {
  const slugs = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));

  return slugs
    .map(readPost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPostWithContent | null {
  try {
    return readPost(slug);
  } catch {
    return null;
  }
}
