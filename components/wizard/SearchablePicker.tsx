"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, X, ArrowDownAZ, ArrowUpZA, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Accent = "blue" | "green";
type SortMode = "featured" | "asc" | "desc";

// Literal class strings so Tailwind's JIT can see them (no dynamic interpolation).
const ACCENT: Record<Accent, { ring: string; text: string; pageBtn: string; active: string }> = {
  blue: {
    ring: "focus:ring-blue-600",
    text: "text-blue-600",
    pageBtn: "hover:bg-blue-50 hover:text-blue-600",
    active: "bg-blue-600 text-white",
  },
  green: {
    ring: "focus:ring-green-600",
    text: "text-green-600",
    pageBtn: "hover:bg-green-50 hover:text-green-600",
    active: "bg-green-600 text-white",
  },
};

interface SearchablePickerProps {
  items: any[];
  getKey: (item: any) => string;
  /** Return true if the item matches the lowercased query. */
  matchesSearch: (item: any, query: string) => boolean;
  /** Render the visual card for an item; it is wrapped in a full-width button. */
  renderItem: (item: any) => React.ReactNode;
  onSelect: (item: any) => void;
  layout?: "list" | "grid";
  placeholder?: string;
  /** Plural noun for counts/empty state, e.g. "countries", "brands". */
  noun?: string;
  accent?: Accent;
  pageSize?: number;
  emptyIcon?: React.ReactNode;
  /** Enables sort + A–Z letter filters. Return the string to sort/group by. */
  getSortValue?: (item: any) => string;
}

/**
 * Search + filter (sort, A–Z) + client-side pagination over a list, in list or
 * grid layout. Used by the /buy and /sell wizards so long country/brand lists
 * are filterable and paged instead of an endless scroll.
 */
export default function SearchablePicker({
  items,
  getKey,
  matchesSearch,
  renderItem,
  onSelect,
  layout = "list",
  placeholder = "Search...",
  noun = "items",
  accent = "blue",
  pageSize = 12,
  emptyIcon,
  getSortValue,
}: SearchablePickerProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [letter, setLetter] = useState<string | null>(null);
  const a = ACCENT[accent];

  // Reset all filters + page whenever the underlying list changes (new step).
  useEffect(() => {
    setQuery("");
    setPage(1);
    setSortMode("featured");
    setLetter(null);
  }, [items]);

  // Letters present in the list (for the A–Z quick filter).
  const availableLetters = useMemo(() => {
    if (!getSortValue) return [];
    const set = new Set<string>();
    for (const it of items) {
      const c = (getSortValue(it) || "").trim().charAt(0).toUpperCase();
      set.add(/[A-Z]/.test(c) ? c : "#");
    }
    return Array.from(set).sort();
  }, [items, getSortValue]);

  const showLetterFilter = !!getSortValue && items.length > pageSize && availableLetters.length > 1;

  const filtered = useMemo(() => {
    let list = items;
    if (letter && getSortValue) {
      list = list.filter((it) => {
        const c = (getSortValue(it) || "").trim().charAt(0).toUpperCase();
        return letter === "#" ? !/[A-Z]/.test(c) : c === letter;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((it) => matchesSearch(it, q));
    if (getSortValue && sortMode !== "featured") {
      list = [...list].sort((x, y) => {
        const cmp = getSortValue(x).localeCompare(getSortValue(y), undefined, { sensitivity: "base" });
        return sortMode === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [items, query, letter, sortMode, matchesSearch, getSortValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  const sortBtn = (mode: SortMode, label: string, Icon: any) => (
    <button
      onClick={() => { setSortMode(mode); setPage(1); }}
      aria-pressed={sortMode === mode}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
        sortMode === mode ? a.active : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
      }`}
    >
      <Icon size={14} aria-hidden="true" /> {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" size={18} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder={t("picker.search")}
          aria-label={t("picker.search")}
          className={`w-full bg-gray-50 dark:bg-neutral-900 dark:text-neutral-100 border-0 rounded-2xl py-4 ps-12 pe-10 outline-none focus:ring-2 ${a.ring} text-sm placeholder:text-gray-400 dark:placeholder:text-neutral-500`}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label={t("picker.clearSearch")}
            className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 rounded-full"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Sort filter */}
      {getSortValue && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sortBtn("featured", t("picker.featured"), Star)}
          {sortBtn("asc", t("picker.sortAsc"), ArrowDownAZ)}
          {sortBtn("desc", t("picker.sortDesc"), ArrowUpZA)}
        </div>
      )}

      {/* A–Z letter filter (long lists) */}
      {showLetterFilter && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setLetter(null); setPage(1); }}
            className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${
              letter === null ? a.active : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t("picker.all")}
          </button>
          {availableLetters.map((l) => (
            <button
              key={l}
              onClick={() => { setLetter(l); setPage(1); }}
              className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${
                letter === l ? a.active : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Result count + page indicator */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-gray-400 dark:text-neutral-500">
          {filtered.length} {t("picker.results")}{letter ? ` · ${letter}` : ""}
        </p>
        {totalPages > 1 && (
          <p className="text-xs font-medium text-gray-400 dark:text-neutral-500">{t("picker.page")} {safePage} {t("picker.of")} {totalPages}</p>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          {emptyIcon}
          <p className="text-gray-400 dark:text-neutral-500 font-medium mt-3">{t("picker.noResults")}</p>
          {(query || letter) && (
            <button
              onClick={() => { setQuery(""); setLetter(null); }}
              className={`mt-2 text-sm font-bold ${a.text}`}
            >
              {t("picker.clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <div className={layout === "grid" ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-2"}>
          {visible.map((item) => (
            <button key={getKey(item)} onClick={() => onSelect(item)} className="w-full text-start">
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label={t("picker.prevPage")}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-sm font-bold text-gray-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed ${a.pageBtn} transition-colors`}
          >
            <ChevronLeft size={16} aria-hidden="true" className="rtl:rotate-180" /> {t("picker.prev")}
          </button>
          <span className="text-sm font-bold text-gray-500 dark:text-neutral-400 tabular-nums">{safePage} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            aria-label={t("picker.nextPage")}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-sm font-bold text-gray-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed ${a.pageBtn} transition-colors`}
          >
            {t("picker.next")} <ChevronRight size={16} aria-hidden="true" className="rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
