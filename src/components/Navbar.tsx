"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BookOpenText,
  Calculator,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

import { categories } from "@/data/categories";
import { RegionSelector } from "@/components/RegionSelector";

function getDropdownColumns(
  toolCount: number
) {
  if (toolCount >= 11) {
    return "grid-cols-3";
  }

  if (toolCount >= 6) {
    return "grid-cols-2";
  }

  return "grid-cols-1";
}

function getDropdownWidth(
  toolCount: number
) {
  if (toolCount >= 11) {
    return "w-[780px]";
  }

  if (toolCount >= 6) {
    return "w-[540px]";
  }

  return "w-[340px]";
}

export function Navbar() {
  const pathname = usePathname();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    openCategory,
    setOpenCategory,
  ] = useState<string | null>(
    null
  );

  const navRef =
    useRef<HTMLElement | null>(
      null
    );

  /* ────────────────────────────────────────────────────────
     Outside click + Escape
     Valid effect: state changes happen inside event callbacks.
  ──────────────────────────────────────────────────────── */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node;

      if (
        !navRef.current?.contains(
          target
        )
      ) {
        setOpenCategory(null);
        setMobileOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpenCategory(null);
        setMobileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  function closeMenus() {
    setOpenCategory(null);
    setMobileOpen(false);
  }

  function toggleCategory(
    slug: string
  ) {
    setOpenCategory(
      (current) =>
        current === slug
          ? null
          : slug
    );
  }

  function isCategoryActive(
    slug: string
  ) {
    return (
      pathname ===
        `/categories/${slug}` ||
      pathname.startsWith(
        `/categories/${slug}/`
      ) ||
      pathname.startsWith(
        `/tools/${slug}/`
      )
    );
  }

  const calculatorCount =
    categories.reduce(
      (total, category) =>
        total +
        category.tools.length,
      0
    );

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="
        sticky
        top-0
        z-50
        border-b
        border-slate-200
        bg-white/95
        shadow-sm
        backdrop-blur
      "
    >
      {/* Top row */}

      <div
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <Link
          href="/"
          onClick={closeMenus}
          aria-label="OnCalculator home"
          className="
            flex
            shrink-0
            items-center
            gap-2.5
          "
        >
          <span
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-lg
              bg-indigo-600
              text-white
              shadow-sm
            "
          >
            <Calculator className="h-5 w-5" />
          </span>

          <span
            className="
              text-lg
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            On
            <span className="text-indigo-600">
              Calculator
            </span>
          </span>
        </Link>

        {/* Desktop controls */}

        <div
          className="
            hidden
            items-center
            gap-2
            md:flex
          "
        >
          <Link
            href="/blog"
            onClick={closeMenus}
            aria-current={
              pathname.startsWith(
                "/blog"
              )
                ? "page"
                : undefined
            }
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-3
              py-2
              text-sm
              font-medium
              transition-colors

              ${
                pathname.startsWith(
                  "/blog"
                )
                  ? `
                    bg-indigo-50
                    text-indigo-700
                  `
                  : `
                    text-slate-600
                    hover:bg-slate-100
                    hover:text-slate-900
                  `
              }
            `}
          >
            <BookOpenText className="h-4 w-4" />

            Blog
          </Link>

          <RegionSelector />
        </div>

        {/* Mobile toggle */}

        <button
          type="button"
          aria-expanded={
            mobileOpen
          }
          aria-controls="mobile-navigation"
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          onClick={() => {
            setMobileOpen(
              (current) =>
                !current
            );

            setOpenCategory(null);
          }}
          className="
            grid
            h-10
            w-10
            place-items-center
            rounded-lg
            text-slate-700
            transition-colors
            hover:bg-slate-100
            md:hidden
          "
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────
          Desktop categories
      ──────────────────────────────────────────────── */}

      <div
        className="
          hidden
          border-t
          border-slate-100
          bg-white
          md:block
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-wrap
            items-center
            gap-1
            px-4
            py-2
            sm:px-6
            lg:px-8
          "
        >
          {categories.map(
            (
              category,
              index
            ) => {
              const expanded =
                openCategory ===
                category.slug;

              const active =
                isCategoryActive(
                  category.slug
                );

              const toolCount =
                category.tools.length;

              const dropdownColumns =
                getDropdownColumns(
                  toolCount
                );

              const dropdownWidth =
                getDropdownWidth(
                  toolCount
                );

              const openFromRight =
                index >=
                Math.ceil(
                  categories.length /
                    2
                );

              const dropdownId =
                `desktop-category-${category.slug}`;

              return (
                <div
                  key={
                    category.slug
                  }
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleCategory(
                        category.slug
                      )
                    }
                    aria-expanded={
                      expanded
                    }
                    aria-controls={
                      dropdownId
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      px-3
                      py-2
                      text-sm
                      font-medium
                      transition-all

                      ${
                        active ||
                        expanded
                          ? `
                            bg-indigo-50
                            text-indigo-700
                          `
                          : `
                            text-slate-600
                            hover:bg-slate-100
                            hover:text-slate-900
                          `
                      }
                    `}
                  >
                    <category.icon
                      className="
                        h-4
                        w-4
                        shrink-0
                      "
                    />

                    <span className="whitespace-nowrap">
                      {category.name}
                    </span>

                    <ChevronDown
                      className={`
                        h-3.5
                        w-3.5
                        shrink-0
                        transition-transform
                        duration-200

                        ${
                          expanded
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {/* Dropdown */}

                  <div
                    id={dropdownId}
                    aria-hidden={
                      !expanded
                    }
                    className={`
                      absolute
                      top-full
                      z-50
                      mt-2
                      origin-top
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-2
                      shadow-2xl
                      shadow-slate-900/10
                      transition-all
                      duration-150

                      ${dropdownWidth}

                      ${
                        openFromRight
                          ? "right-0"
                          : "left-0"
                      }

                      ${
                        expanded
                          ? `
                            visible
                            translate-y-0
                            opacity-100
                          `
                          : `
                            pointer-events-none
                            invisible
                            -translate-y-1
                            opacity-0
                          `
                      }
                    `}
                  >
                    {/* Category link */}

                    <Link
                      href={`/categories/${category.slug}`}
                      onClick={
                        closeMenus
                      }
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        bg-indigo-50
                        px-4
                        py-3
                        transition-colors
                        hover:bg-indigo-100
                      "
                    >
                      <span
                        className="
                          grid
                          h-10
                          w-10
                          shrink-0
                          place-items-center
                          rounded-lg
                          bg-white
                          text-indigo-600
                          shadow-sm
                        "
                      >
                        <category.icon className="h-5 w-5" />
                      </span>

                      <span
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <span
                          className="
                            block
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {category.name}
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-xs
                            text-slate-500
                          "
                        >
                          Browse all{" "}
                          {toolCount}{" "}
                          calculator
                          {toolCount ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </span>

                      <ChevronRight
                        className="
                          h-4
                          w-4
                          shrink-0
                          text-indigo-500
                        "
                      />
                    </Link>

                    {/* Multi-column tools */}

                    <div
                      className={`
                        mt-2
                        grid
                        max-h-[460px]
                        gap-1
                        overflow-y-auto
                        overscroll-contain

                        ${dropdownColumns}
                      `}
                    >
                      {category.tools.map(
                        (tool) => {
                          const href =
                            `/tools/${category.slug}/${tool.slug}`;

                          const toolActive =
                            pathname ===
                            href;

                          return (
                            <Link
                              key={
                                tool.slug
                              }
                              href={
                                href
                              }
                              onClick={
                                closeMenus
                              }
                              aria-current={
                                toolActive
                                  ? "page"
                                  : undefined
                              }
                              className={`
                                group
                                flex
                                min-w-0
                                items-start
                                gap-2.5
                                rounded-xl
                                px-3
                                py-2.5
                                transition-colors

                                ${
                                  toolActive
                                    ? `
                                      bg-indigo-50
                                    `
                                    : `
                                      hover:bg-slate-50
                                    `
                                }
                              `}
                            >
                              <span
                                className={`
                                  mt-0.5
                                  grid
                                  h-8
                                  w-8
                                  shrink-0
                                  place-items-center
                                  rounded-lg
                                  transition-colors

                                  ${
                                    toolActive
                                      ? `
                                        bg-indigo-100
                                        text-indigo-700
                                      `
                                      : `
                                        bg-slate-100
                                        text-slate-500
                                        group-hover:bg-indigo-50
                                        group-hover:text-indigo-600
                                      `
                                  }
                                `}
                              >
                                <tool.icon className="h-4 w-4" />
                              </span>

                              <span
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >
                                <span
                                  className={`
                                    block
                                    text-sm
                                    font-semibold
                                    leading-5

                                    ${
                                      toolActive
                                        ? "text-indigo-700"
                                        : "text-slate-800"
                                    }
                                  `}
                                >
                                  {
                                    tool.name
                                  }
                                </span>

                                <span
                                  className="
                                    mt-0.5
                                    line-clamp-2
                                    block
                                    text-[10px]
                                    leading-4
                                    text-slate-500
                                  "
                                >
                                  {
                                    tool.description
                                  }
                                </span>
                              </span>
                            </Link>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}

          <span
            className="
              ml-auto
              hidden
              whitespace-nowrap
              text-[10px]
              font-medium
              text-slate-400
              xl:inline
            "
          >
            {calculatorCount} calculators
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          Mobile
      ──────────────────────────────────────────────── */}

      <div
        id="mobile-navigation"
        className={`
          border-t
          border-slate-200
          bg-white
          md:hidden

          ${
            mobileOpen
              ? "block"
              : "hidden"
          }
        `}
      >
        <div
          className="
            max-h-[calc(100dvh-4rem)]
            overflow-y-auto
            overscroll-contain
            px-4
            py-4
            sm:px-6
          "
        >
          {/* Region */}

          <div
            className="
              mb-4
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-3
            "
          >
            <p
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Your Region
            </p>

            <RegionSelector />
          </div>

          {/* Heading */}

          <div
            className="
              mb-3
              flex
              items-center
              justify-between
              gap-3
              px-1
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Calculator Categories
            </p>

            <span
              className="
                text-[10px]
                text-slate-400
              "
            >
              {calculatorCount} tools
            </span>
          </div>

          {/* Accordions */}

          <div className="space-y-2">
            {categories.map(
              (category) => {
                const expanded =
                  openCategory ===
                  category.slug;

                const active =
                  isCategoryActive(
                    category.slug
                  );

                const mobileId =
                  `mobile-category-${category.slug}`;

                return (
                  <section
                    key={
                      category.slug
                    }
                    className={`
                      overflow-hidden
                      rounded-xl
                      border

                      ${
                        active
                          ? `
                            border-indigo-200
                          `
                          : `
                            border-slate-200
                          `
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleCategory(
                          category.slug
                        )
                      }
                      aria-expanded={
                        expanded
                      }
                      aria-controls={
                        mobileId
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        px-3
                        py-3
                        text-left
                        transition-colors

                        ${
                          active ||
                          expanded
                            ? `
                              bg-indigo-50
                            `
                            : `
                              bg-white
                              hover:bg-slate-50
                            `
                        }
                      `}
                    >
                      <span
                        className={`
                          grid
                          h-9
                          w-9
                          shrink-0
                          place-items-center
                          rounded-lg

                          ${
                            active
                              ? `
                                bg-indigo-100
                                text-indigo-700
                              `
                              : `
                                bg-slate-100
                                text-slate-600
                              `
                          }
                        `}
                      >
                        <category.icon className="h-4 w-4" />
                      </span>

                      <span
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <span
                          className="
                            block
                            text-sm
                            font-bold
                            text-slate-900
                          "
                        >
                          {category.name}
                        </span>

                        <span
                          className="
                            mt-0.5
                            block
                            text-[10px]
                            text-slate-500
                          "
                        >
                          {
                            category
                              .tools
                              .length
                          }{" "}
                          calculators
                        </span>
                      </span>

                      <ChevronDown
                        className={`
                          h-4
                          w-4
                          shrink-0
                          text-slate-400
                          transition-transform

                          ${
                            expanded
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    <div
                      id={mobileId}
                      className={`
                        grid
                        transition-[grid-template-rows]
                        duration-200

                        ${
                          expanded
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }
                      `}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="
                            border-t
                            border-slate-200
                            bg-white
                            p-2
                          "
                        >
                          <Link
                            href={`/categories/${category.slug}`}
                            onClick={
                              closeMenus
                            }
                            className="
                              flex
                              items-center
                              justify-between
                              rounded-lg
                              bg-indigo-50
                              px-3
                              py-2.5
                              text-sm
                              font-semibold
                              text-indigo-700
                            "
                          >
                            View all{" "}
                            {
                              category.name
                            }

                            <ChevronRight className="h-4 w-4" />
                          </Link>

                          <div className="mt-1 space-y-0.5">
                            {category.tools.map(
                              (tool) => {
                                const href =
                                  `/tools/${category.slug}/${tool.slug}`;

                                const toolActive =
                                  pathname ===
                                  href;

                                return (
                                  <Link
                                    key={
                                      tool.slug
                                    }
                                    href={
                                      href
                                    }
                                    onClick={
                                      closeMenus
                                    }
                                    aria-current={
                                      toolActive
                                        ? "page"
                                        : undefined
                                    }
                                    className={`
                                      flex
                                      items-center
                                      gap-3
                                      rounded-lg
                                      px-3
                                      py-2.5
                                      text-sm
                                      transition-colors

                                      ${
                                        toolActive
                                          ? `
                                            bg-indigo-50
                                            font-semibold
                                            text-indigo-700
                                          `
                                          : `
                                            text-slate-700
                                            hover:bg-slate-50
                                          `
                                      }
                                    `}
                                  >
                                    <tool.icon
                                      className="
                                        h-4
                                        w-4
                                        shrink-0
                                        text-slate-400
                                      "
                                    />

                                    <span
                                      className="
                                        min-w-0
                                        flex-1
                                      "
                                    >
                                      {
                                        tool.name
                                      }
                                    </span>

                                    <ChevronRight
                                      className="
                                        h-3.5
                                        w-3.5
                                        shrink-0
                                        text-slate-300
                                      "
                                    />
                                  </Link>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              }
            )}
          </div>

          {/* Blog */}

          <div
            className="
              mt-5
              border-t
              border-slate-200
              pt-4
            "
          >
            <Link
              href="/blog"
              onClick={
                closeMenus
              }
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                px-4
                py-3
                text-sm
                font-semibold
                text-slate-800
                transition-colors
                hover:bg-slate-50
              "
            >
              <BookOpenText
                className="
                  h-4
                  w-4
                  text-indigo-600
                "
              />

              <span className="flex-1">
                Blog &amp; Guides
              </span>

              <ChevronRight
                className="
                  h-4
                  w-4
                  text-slate-400
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}