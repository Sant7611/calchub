"use client";

import { type FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function HomeToolSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    router.push(value ? `/tools?q=${encodeURIComponent(value)}` : "/tools");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
      <label htmlFor="homepage-tool-search" className="sr-only">
        Search calculators
      </label>
      <div className="flex rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 transition-shadow focus-within:ring-2 focus-within:ring-indigo-500">
        <Search className="ml-3 h-5 w-5 shrink-0 self-center text-slate-400" aria-hidden="true" />
        <input
          id="homepage-tool-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tax, salary, EMI, BMI and more"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}
