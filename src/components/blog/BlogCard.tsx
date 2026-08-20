import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-600">
          {post.category}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formattedDate}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {post.readingTime} min read
        </span>
      </div>

      <h2 className="mt-4 text-lg leading-snug font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
        {post.title}
      </h2>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
        {post.excerpt}
      </p>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
        Read guide
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
