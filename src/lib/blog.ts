import matter from "gray-matter";

import { blogSources } from "@/data/generated-blog-sources";

/**
 * Blog data layer.
 *
 * Blog .mdx files are converted into a generated TypeScript module before
 * Next.js starts. This keeps blog content bundled with the app and avoids
 * runtime filesystem access in Cloudflare Workers.
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

/** Strict frontmatter parsing — malformed posts fail loudly when listed. */
function parseFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): Omit<BlogPost, "slug" | "readingTime"> {
  const str = (key: string) => {
    const value = data[key];
    if (typeof value !== "string" || value.length === 0) {
      throw new Error(
        `Blog post "${slug}" is missing required frontmatter field "${key}".`,
      );
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
  const raw = blogSources[slug];

  if (!raw) {
    throw new Error(`Blog post "${slug}" was not found.`);
  }

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
  return Object.keys(blogSources)
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
