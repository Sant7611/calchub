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

/**
 * Curated-by-relevance article links without maintaining a second manual list.
 * Same-category posts receive a strong boost and shared tags add specificity.
 */
export function getRelatedPosts(
  post: BlogPost,
  limit = 3,
): BlogPostWithContent[] {
  return getPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      const sameCategory = candidate.category === post.category ? 4 : 0;
      const sharedTags = candidate.tags.filter((tag) =>
        post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase()),
      ).length;
      const sameTool = candidate.relatedToolSlug === post.relatedToolSlug ? 3 : 0;

      return {
        candidate,
        score: sameCategory + sharedTags * 2 + sameTool,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.candidate.date).getTime() -
        new Date(a.candidate.date).getTime()
      );
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
