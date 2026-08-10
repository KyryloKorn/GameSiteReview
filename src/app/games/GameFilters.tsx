"use client";

import { useRouter, useSearchParams } from "next/navigation";
import "./games.css";

const SORT_OPTIONS = [
  { value: "rating_count desc", label: "Most Popular" },
  { value: "rating desc", label: "Highest Rated" },
  { value: "rating asc", label: "Lowest Rated" },
  { value: "first_release_date desc", label: "Newest First" },
  { value: "first_release_date asc", label: "Oldest First" },
  { value: "name asc", label: "A → Z" },
  { value: "name desc", label: "Z → A" },
];

const GENRE_OPTIONS = [
  { value: "2", label: "Point-and-click" },
  { value: "4", label: "Fighting" },
  { value: "5", label: "Shooter" },
  { value: "7", label: "Music" },
  { value: "8", label: "Platform" },
  { value: "9", label: "Puzzle" },
  { value: "10", label: "Racing" },
  { value: "11", label: "Real Time Strategy" },
  { value: "12", label: "Role-playing (RPG)" },
  { value: "13", label: "Simulator" },
  { value: "14", label: "Sport" },
  { value: "15", label: "Strategy" },
  { value: "16", label: "Turn-based strategy" },
  { value: "24", label: "Tactical" },
  { value: "25", label: "Hack and slash" },
  { value: "26", label: "Quiz/Trivia" },
  { value: "30", label: "Pinball" },
  { value: "31", label: "Adventure" },
  { value: "32", label: "Indie" },
  { value: "33", label: "Arcade" },
  { value: "34", label: "Visual Novel" },
  { value: "35", label: "Card & Board" },
  { value: "36", label: "MOBA" },
];

const PLATFORM_OPTIONS = [
  { value: "6", label: "PC" },
  { value: "48", label: "PS4" },
  { value: "167", label: "PS5" },
  { value: "49", label: "Xbox One" },
  { value: "169", label: "Xbox Series" },
  { value: "130", label: "Switch" },
  { value: "34", label: "Android" },
  { value: "39", label: "iOS" },
];

interface GameFiltersProps {
  currentGenre?: string;
  currentPlatform?: string;
  currentSort?: string;
  currentYearFrom?: string;
  currentYearTo?: string;
  currentHideTracked?: string;
  isLoggedIn?: boolean;
  trackedCount?: number;
}

export default function GameFilters({
  currentGenre,
  currentPlatform,
  currentSort = "rating_count desc",
  currentYearFrom,
  currentYearTo,
  currentHideTracked,
  isLoggedIn,
  trackedCount = 0,
}: GameFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("offset"); // Reset pagination
    router.push(`/games?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/games?${params.toString()}`);
  };

  const hasActiveFilters =
    currentGenre ||
    currentPlatform ||
    currentYearFrom ||
    currentYearTo ||
    currentHideTracked === "true";

  return (
    <div className="game-filters" id="game-filters">
      <div className="game-filters__row">
        <select
          className="game-filters__select"
          value={currentGenre || ""}
          onChange={(e) => updateFilter("genre", e.target.value)}
          id="filter-genre"
        >
          <option value="">All Genres</option>
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className="game-filters__select"
          value={currentPlatform || ""}
          onChange={(e) => updateFilter("platform", e.target.value)}
          id="filter-platform"
        >
          <option value="">All Platforms</option>
          {PLATFORM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          className="game-filters__select"
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          id="filter-sort"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="number"
          className="game-filters__year-input"
          placeholder="From year"
          value={currentYearFrom || ""}
          min={1970}
          max={2030}
          onChange={(e) => updateFilter("yearFrom", e.target.value)}
          id="filter-year-from"
        />

        <input
          type="number"
          className="game-filters__year-input"
          placeholder="To year"
          value={currentYearTo || ""}
          min={1970}
          max={2030}
          onChange={(e) => updateFilter("yearTo", e.target.value)}
          id="filter-year-to"
        />

        {isLoggedIn && (
          <label className="game-filters__checkbox-label" id="filter-hide-tracked">
            <input
              type="checkbox"
              checked={currentHideTracked === "true"}
              onChange={(e) => updateFilter("hideTracked", e.target.checked ? "true" : "")}
            />
            <span>🙈 Hide My Tracked Games ({trackedCount})</span>
          </label>
        )}

        {hasActiveFilters && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={clearAllFilters}
            id="filter-clear"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
