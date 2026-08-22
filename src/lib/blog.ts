import { generatedBlogPosts } from "@/data/generated-blog-sources";

/**
 * Blog data layer.
 *
 * Blog .mdx files are parsed and rendered to HTML by
 * scripts/generate-blog-data.mjs before Next.js starts. Runtime requests only
 * read ordinary bundled data; they never touch the filesystem or compile MDX.
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
  html: string;
}

const BLOG_POSTS: Record<string, BlogPostWithContent> = generatedBlogPosts;

/** All posts, newest first. */
export function getPosts(): BlogPostWithContent[] {
  return Object.values(BLOG_POSTS).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPostWithContent | null {
  return BLOG_POSTS[slug] ?? null;
}
