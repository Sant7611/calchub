import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPosts, getPostBySlug, type BlogPost } from "@/lib/blog";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CtaBox } from "@/components/blog/CtaBox";
import styles from "./BlogArticle.module.css";

const SITE_URL = "https://oncalculator.tech";
const SITE_NAME = "OnCalculator";
const BLOG_URL = `${SITE_URL}/blog`;

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

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: articleUrl,
      siteName: SITE_NAME,
      publishedTime: post.date,
      section: post.category,
      tags: post.tags,
    },
  };
}

/** BlogPosting JSON-LD — emitted in the same server render as the article. */
function PostJsonLd({ post }: { post: BlogPost }) {
  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    url: articleUrl,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    articleSection: post.category,
    keywords: post.tags,
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${BLOG_URL}#blog`,
      name: `${SITE_NAME} Blog`,
      url: BLOG_URL,
    },
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

      {/*
       * Article HTML is generated from repository-owned MDX during prebuild.
       * The build step escapes authored text and only emits the supported
       * Markdown elements, so Cloudflare never compiles/evaluates MDX here.
       */}
      <div
        className={`${styles.content} mt-8`}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* The traffic flywheel: every article ends at its calculator. */}
      <CtaBox toolSlug={post.relatedToolSlug} />
    </article>
  );
}
