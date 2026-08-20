import type { Metadata } from "next";
import type { MDXComponents } from "mdx/types";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getPosts, getPostBySlug, type BlogPost } from "@/lib/blog";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CtaBox } from "@/components/blog/CtaBox";
import { Callout } from "@/components/blog/Callout";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// One static HTML file per article — content-as-code, fully pre-rendered.
export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

/** Article typography — indigo links, spaced headings, styled quotes. */
const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-10 text-2xl font-bold tracking-tight text-slate-900" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 text-xl font-semibold text-slate-900" {...props} />
  ),
  p: (props) => <p className="mt-4 leading-relaxed text-slate-700" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-700" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition-colors hover:text-indigo-800"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-4 border-indigo-200 bg-indigo-50/50 py-2 pr-4 pl-4 italic text-slate-600"
      {...props}
    />
  ),
  code: (props) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800" {...props} />
  ),
  // Custom author-facing component: <Callout title="...">...</Callout>
  Callout,
};

/** BlogPosting JSON-LD — emitted in the same server render as the article. */
function PostJsonLd({ post }: { post: BlogPost }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    mainEntityOfPage: `https://oncalculator.app/blog/${post.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PostJsonLd post={post} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      {/* H1 + meta row */}
      <header className="mt-6">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          {formattedDate} · {post.readingTime} min read · {post.category}
        </p>
      </header>

      {/* MDX body — compiled server-side, styled by mdxComponents */}
      <div className="mt-8">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {/* The traffic flywheel: every article ends at its calculator. */}
      <CtaBox toolSlug={post.relatedToolSlug} />
    </article>
  );
}
