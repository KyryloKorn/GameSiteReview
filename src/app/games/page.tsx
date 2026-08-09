import type { Metadata } from "next";
import { searchGames } from "@/lib/igdb";
import GameCard from "@/components/game/GameCard";
import SearchBar from "@/components/game/SearchBar";
import GameFilters from "./GameFilters";
import Pagination from "./Pagination";
import "./games.css";

export const metadata: Metadata = {
  title: "Browse Games",
  description: "Explore 200K+ games. Search, filter by genre, platform, and year. Find your next favorite game.",
};

interface GamesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    platform?: string;
    yearFrom?: string;
    yearTo?: string;
    sort?: string;
    offset?: string;
  }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const offset = parseInt(params.offset || "0");
  const limit = 20;

  let result = { games: [] as any[], total: 0 };
  let error: string | null = null;

  try {
    result = await searchGames({
      query: query || undefined,
      genres: params.genre ? params.genre.split(",").map(Number) : undefined,
      platforms: params.platform ? params.platform.split(",").map(Number) : undefined,
      yearFrom: params.yearFrom ? parseInt(params.yearFrom) : 1999,
      yearTo: params.yearTo ? parseInt(params.yearTo) : undefined,
      sort: params.sort || "rating_count desc",
      limit,
      offset,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load games";
  }

  const hasMore = result.games.length >= limit;
  const page = Math.floor(offset / limit) + 1;

  return (
    <div className="games-page" id="games-page">
      <div className="container">
        {/* Header */}
        <div className="games-page__header">
          <h1 className="games-page__title">
            Browse <span className="games-page__title-accent">Games</span>
          </h1>
          <p className="games-page__subtitle">
            Explore a massive catalog of games. Find, rate, and add them to your tier lists.
          </p>
        </div>

        {/* Search */}
        <div className="games-page__search">
          <SearchBar defaultValue={query} />
        </div>

        {/* Filters */}
        <GameFilters
          currentGenre={params.genre}
          currentPlatform={params.platform}
          currentSort={params.sort}
          currentYearFrom={params.yearFrom}
          currentYearTo={params.yearTo}
        />

        {/* Error */}
        {error && (
          <div className="games-page__error glass-card" id="games-error">
            <div className="games-page__error-icon">⚠️</div>
            <h3>Unable to load games</h3>
            <p>{error}</p>
            <p className="games-page__error-hint">
              Make sure <code>TWITCH_CLIENT_ID</code> and <code>TWITCH_CLIENT_SECRET</code> are set in your <code>.env</code> file.
              <br />
              Register at{" "}
              <a href="https://dev.twitch.tv/console" target="_blank" rel="noopener noreferrer">
                dev.twitch.tv/console
              </a>
            </p>
          </div>
        )}

        {/* Results */}
        {!error && (
          <>
            {query && (
              <p className="games-page__results-count">
                Showing results for &ldquo;<strong>{query}</strong>&rdquo;
              </p>
            )}

            {result.games.length > 0 ? (
              <div className="games-grid" id="games-grid">
                {result.games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="games-page__empty glass-card">
                <div className="games-page__empty-icon">🎮</div>
                <h3>No games found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={page}
              hasMore={hasMore}
              searchParams={params}
              limit={limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
