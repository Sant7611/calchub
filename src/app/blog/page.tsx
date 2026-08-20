import type { Metadata } from "next";
import { getPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";

// Server Component — the whole index renders to static HTML at build time.
export const metadata: Metadata = {
  title: "Blog & Guides",
  description:
    "Practical, example-driven guides on loans, health, math and money — each one paired with a free calculator.",
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase">
          {posts.length} guides
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Blog &amp; Guides
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Every guide ends where a calculator begins — learn the formula here,
          then run your own numbers in the matching tool.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
