"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { categories, citySlugMap, type Category } from "@/data/categories";

interface MatchedCategory extends Category {
  matchField: "title" | "sub" | "keywords";
  matchText: string;
}

function fuzzyMatch(query: string): MatchedCategory[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const results: MatchedCategory[] = [];

  for (const cat of categories) {
    if (cat.title.toLowerCase().includes(q)) {
      results.push({ ...cat, matchField: "title", matchText: cat.title });
      continue;
    }
    if (cat.sub.toLowerCase().includes(q)) {
      results.push({ ...cat, matchField: "sub", matchText: cat.sub });
      continue;
    }
    const matchedKeyword = cat.keywords.find((kw) => kw.toLowerCase().includes(q));
    if (matchedKeyword) {
      results.push({ ...cat, matchField: "keywords", matchText: matchedKeyword });
      continue;
    }
    const reverseMatch = cat.keywords.find((kw) => q.includes(kw.toLowerCase()));
    if (reverseMatch) {
      results.push({ ...cat, matchField: "keywords", matchText: reverseMatch });
    }
  }

  return results;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const q = query.toLowerCase().trim();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const cityOptions = [
  { value: "all", label: "All India" },
  ...Object.keys(citySlugMap).map((name) => ({ value: name, label: name })),
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [results, setResults] = useState<MatchedCategory[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    const matched = fuzzyMatch(value);
    setResults(matched);
    setShowDropdown(matched.length > 0 && value.length > 0);
    setActiveIndex(-1);
  }, []);

  const navigateToCategory = useCallback(
    (slug: string) => {
      const citySlug = city === "all" ? "india" : (citySlugMap[city] || "india");
      router.push(`/${slug}/${citySlug}`);
      setShowDropdown(false);
    },
    [city, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        const matched = fuzzyMatch(query);
        if (matched.length > 0) {
          navigateToCategory(matched[0].slug);
        }
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          navigateToCategory(results[activeIndex].slug);
        } else if (results.length > 0) {
          navigateToCategory(results[0].slug);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      const idx = activeIndex >= 0 ? activeIndex : 0;
      navigateToCategory(results[idx].slug);
    } else if (query.trim()) {
      const matched = fuzzyMatch(query);
      if (matched.length > 0) {
        navigateToCategory(matched[0].slug);
      }
    }
  };

  const selectedCityLabel = cityOptions.find((c) => c.value === city)?.label || "All India";

  return (
    <div className="hero-search-wrapper" ref={wrapperRef}>
      <form className="hero-search" onSubmit={handleSubmit} autoComplete="off">
        {/* Category input */}
        <div className="hero-search-field">
          <Search className="hero-search-icon" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => {
              if (results.length > 0 && query.length > 0) setShowDropdown(true);
              setShowCityDropdown(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder='Try "escalator", "fire alarm", "EV charger"...'
            className="hero-search-input"
            aria-label="Search service categories"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            role="combobox"
          />
        </div>

        {/* Divider */}
        <div className="hero-search-divider" />

        {/* City selector - custom dropdown */}
        <div className="hero-search-field hero-search-city">
          <button
            type="button"
            className="hero-city-trigger"
            onClick={() => {
              setShowCityDropdown((prev) => !prev);
              setShowDropdown(false);
            }}
            aria-label="Select city"
            aria-expanded={showCityDropdown}
          >
            <MapPin className="hero-search-icon" size={16} />
            <span className="hero-city-label">{selectedCityLabel}</span>
            <ChevronDown className={`hero-city-chevron ${showCityDropdown ? "open" : ""}`} size={14} />
          </button>

          {showCityDropdown && (
            <div className="hero-city-dropdown">
              {cityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`hero-city-option ${city === opt.value ? "selected" : ""}`}
                  onClick={() => {
                    setCity(opt.value);
                    setShowCityDropdown(false);
                  }}
                >
                  {opt.label}
                  {city === opt.value && <span className="hero-city-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search button */}
        <button type="submit" className="hero-search-btn" aria-label="Search">
          Search
        </button>
      </form>

      {/* Category dropdown results */}
      {showDropdown && results.length > 0 && (
        <div className="hero-search-dropdown" role="listbox">
          {results.map((cat, i) => (
            <button
              key={cat.slug}
              type="button"
              className={`hero-search-result ${i === activeIndex ? "active" : ""}`}
              onClick={() => navigateToCategory(cat.slug)}
              onMouseEnter={() => setActiveIndex(i)}
              role="option"
              aria-selected={i === activeIndex}
            >
              <div className="hero-search-result-main">
                <span className="hero-search-result-title">
                  {highlightMatch(cat.title, query)}
                </span>
                <span className="hero-search-result-sub">{cat.sub}</span>
              </div>
              {cat.matchField === "keywords" && (
                <span className="hero-search-result-hint">
                  Matches: &ldquo;{highlightMatch(cat.matchText, query)}&rdquo;
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

