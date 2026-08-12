import "server-only";
import { cacheGetOrSet, singleflight } from "@/lib/cache";
import { igdbImageUrl } from "@/lib/igdb-utils";
export { igdbImageUrl };

// ============================================================
// IGDB API Client
// ============================================================

const IGDB_BASE_URL = "https://api.igdb.com/v4";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";

interface TwitchToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// Token state — cached in-process
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid Twitch OAuth2 token, refreshing if needed.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET must be set in .env."
    );
  }

  const token = await singleflight("twitch-token", async () => {
    const res = await fetch(
      `${TWITCH_TOKEN_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (!res.ok) {
      throw new Error(`Twitch token request failed: ${res.status}`);
    }

    return res.json() as Promise<TwitchToken>;
  });

  cachedToken = token.access_token;
  tokenExpiresAt = Date.now() + token.expires_in * 1000;

  return cachedToken;
}

/**
 * Make a request to the IGDB API with rate-limit retries (4 req/sec limit).
 * Handles 429 Too Many Requests with exponential backoff.
 */
async function igdbFetch<T>(
  endpoint: string,
  query: string,
  maxRetries = 5
): Promise<T> {
  const accessToken = await getAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Client-ID": clientId,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "text/plain",
        },
        body: query,
      });

      if (res.status === 429) {
        // IGDB rate limit (4 req/sec). Wait with exponential backoff & random jitter.
        const backoffMs = Math.pow(2, attempt) * 500 + Math.floor(Math.random() * 250);
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        console.warn(`[IGDB] API warning (${res.status}): ${text}`);
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        return [] as unknown as T;
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        console.error("[IGDB] Fetch failed after retries:", err);
        return [] as unknown as T;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return [] as unknown as T;
}

// ============================================================
// Type Definitions
// ============================================================

export interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  cover?: { id: number; image_id: string };
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string; abbreviation?: string }[];
  first_release_date?: number; // Unix timestamp
  rating?: number;
  rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  screenshots?: { id: number; image_id: string }[];
  involved_companies?: {
    id: number;
    company: { id: number; name: string };
    developer: boolean;
    publisher: boolean;
  }[];
  similar_games?: { id: number; name: string; slug: string; cover?: { image_id: string } }[];
  game_modes?: { id: number; name: string }[];
  themes?: { id: number; name: string }[];
  websites?: { id: number; url: string; category: number }[];
}

export interface IGDBSearchResult {
  games: IGDBGame[];
  total: number;
}



// ============================================================
// API Functions (with caching & rate limiting)
// ============================================================

/**
 * Search games by name with filters.
 */
export async function searchGames(options: {
  query?: string;
  genres?: number[];
  platforms?: number[];
  yearFrom?: number;
  yearTo?: number;
  limit?: number;
  offset?: number;
  sort?: string;
  excludeIds?: number[];
}): Promise<IGDBSearchResult> {
  const {
    query,
    genres,
    platforms,
    yearFrom = 1999,
    yearTo,
    limit = 24,
    offset = 0,
    sort = "rating_count desc",
    excludeIds,
  } = options;

  const cacheKey = `games:search:${JSON.stringify(options)}`;

  return cacheGetOrSet(
    cacheKey,
    async () => {
      let igdbSort = sort.replace("total_rating", "rating");

      // Text search
      if (query && query.trim()) {
        const whereConditions: string[] = ["cover != null", "version_parent = null"];
        if (yearFrom) {
          whereConditions.push(
            `first_release_date >= ${Math.floor(new Date(`${yearFrom}-01-01`).getTime() / 1000)}`
          );
        }
        if (yearTo) {
          whereConditions.push(
            `first_release_date <= ${Math.floor(new Date(`${yearTo}-12-31`).getTime() / 1000)}`
          );
        }
        if (genres?.length) {
          whereConditions.push(`genres = (${genres.join(",")})`);
        }
        if (platforms?.length) {
          whereConditions.push(`platforms = (${platforms.join(",")})`);
        }
        if (excludeIds?.length) {
          whereConditions.push(`id != (${excludeIds.join(",")})`);
        }

        const searchQuery = `
          search "${query.replace(/"/g, '\\"')}";
          fields name, slug, summary, cover.image_id, genres.name, platforms.name, platforms.abbreviation, first_release_date, rating, rating_count, total_rating;
          where ${whereConditions.join(" & ")};
          limit ${limit};
          offset ${offset};
        `;

        const games = await igdbFetch<IGDBGame[]>("games", searchQuery);
        return { games, total: games.length >= limit ? offset + limit + 1 : offset + games.length };
      }

      // Browse mode
      const conditions: string[] = ["cover != null", "version_parent = null"];

      if (yearFrom) {
        conditions.push(
          `first_release_date >= ${Math.floor(new Date(`${yearFrom}-01-01`).getTime() / 1000)}`
        );
      }
      if (yearTo) {
        conditions.push(
          `first_release_date <= ${Math.floor(new Date(`${yearTo}-12-31`).getTime() / 1000)}`
        );
      }
      if (genres?.length) {
        conditions.push(`genres = (${genres.join(",")})`);
      }
      if (platforms?.length) {
        conditions.push(`platforms = (${platforms.join(",")})`);
      }
      if (excludeIds?.length) {
        conditions.push(`id != (${excludeIds.join(",")})`);
      }

      const whereClause = `where ${conditions.join(" & ")};`;

      const browseQuery = `
        fields name, slug, summary, cover.image_id, genres.name, platforms.name, platforms.abbreviation, first_release_date, rating, rating_count, total_rating;
        ${whereClause}
        sort ${igdbSort};
        limit ${limit};
        offset ${offset};
      `;

      const games = await igdbFetch<IGDBGame[]>("games", browseQuery);
      return { games, total: games.length >= limit ? offset + limit + 1 : offset + games.length };
    },
    { ttl: 300, prefix: "gsr_v3" }
  );
}

/**
 * Get a single game by IGDB ID.
 */
export async function getGameById(igdbId: number): Promise<IGDBGame | null> {
  const cacheKey = `games:detail:${igdbId}`;

  return cacheGetOrSet(
    cacheKey,
    async () => {
      const query = `
        fields name, slug, summary, cover.image_id,
          genres.name, platforms.name, platforms.abbreviation,
          first_release_date, rating, rating_count, total_rating, total_rating_count,
          screenshots.image_id,
          involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
          similar_games.name, similar_games.slug, similar_games.cover.image_id,
          game_modes.name, themes.name,
          websites.url, websites.category;
        where id = ${igdbId};
        limit 1;
      `;

      const games = await igdbFetch<IGDBGame[]>("games", query);
      return games[0] || null;
    },
    { ttl: 86400, prefix: "gsr" }
  );
}

/**
 * Get a game by slug.
 */
export async function getGameBySlug(slug: string): Promise<IGDBGame | null> {
  const cacheKey = `games:slug:${slug}`;

  return cacheGetOrSet(
    cacheKey,
    async () => {
      const query = `
        fields name, slug, summary, cover.image_id,
          genres.name, platforms.name, platforms.abbreviation,
          first_release_date, rating, rating_count, total_rating, total_rating_count,
          screenshots.image_id,
          involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
          similar_games.name, similar_games.slug, similar_games.cover.image_id,
          game_modes.name, themes.name,
          websites.url, websites.category;
        where slug = "${slug.replace(/"/g, '\\"')}";
        limit 1;
      `;

      const games = await igdbFetch<IGDBGame[]>("games", query);
      return games[0] || null;
    },
    { ttl: 86400, prefix: "gsr" }
  );
}

/**
 * Get trending/popular games.
 */
export async function getTrendingGames(limit: number = 12): Promise<IGDBGame[]> {
  const cacheKey = `games:trending:${limit}`;

  return cacheGetOrSet(
    cacheKey,
    async () => {
      const twoYearsAgo = Math.floor(
        (Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) / 1000
      );

      const query = `
        fields name, slug, summary, cover.image_id, genres.name, platforms.name, platforms.abbreviation, first_release_date, rating, rating_count;
        where cover != null
          & version_parent = null
          & first_release_date >= ${twoYearsAgo};
        sort rating_count desc;
        limit ${limit};
      `;

      return igdbFetch<IGDBGame[]>("games", query);
    },
    { ttl: 3600, prefix: "gsr" }
  );
}

/**
 * Get available genres.
 */
export async function getGenres(): Promise<{ id: number; name: string }[]> {
  return cacheGetOrSet(
    "meta:genres",
    async () => {
      const query = `fields name; sort name asc; limit 50;`;
      return igdbFetch<{ id: number; name: string }[]>("genres", query);
    },
    { ttl: 86400 * 7, prefix: "gsr" }
  );
}

/**
 * Get available platforms.
 */
export async function getPlatforms(): Promise<{ id: number; name: string; abbreviation?: string }[]> {
  return cacheGetOrSet(
    "meta:platforms",
    async () => {
      const query = `
        fields name, abbreviation;
        where category = (1, 5, 6);
        sort name asc;
        limit 50;
      `;
      return igdbFetch<{ id: number; name: string; abbreviation?: string }[]>("platforms", query);
    },
    { ttl: 86400 * 7, prefix: "gsr" }
  );
}

/**
 * Fetch upcoming and newly released games for a specific month calendar view.
 */
export async function getCalendarReleases(
  year: number,
  month: number,
  filter: "major" | "all" = "major"
): Promise<IGDBGame[]> {
  const monthStart = Math.floor(Date.UTC(year, month - 1, 1, 0, 0, 0) / 1000);
  const monthEnd = Math.floor(Date.UTC(year, month, 0, 23, 59, 59) / 1000);

  const cacheKey = `calendar:releases:v7:${year}-${month}:${filter}`;

  return cacheGetOrSet(
    cacheKey,
    async () => {
      let whereClause = `where first_release_date >= ${monthStart} & first_release_date <= ${monthEnd} & cover != null & version_parent = null`;

      if (filter === "major") {
        whereClause += ` & hypes != null & hypes >= 100`;
      }

      if (filter === "all") {
        const popularQuery = `
          fields name, slug, cover.image_id, first_release_date, rating, genres.name, platforms.name, summary, hypes;
          ${whereClause};
          sort hypes desc;
          limit 250;
        `;
        const chronologyQuery = `
          fields name, slug, cover.image_id, first_release_date, rating, genres.name, platforms.name, summary, hypes;
          ${whereClause};
          sort first_release_date asc;
          limit 250;
        `;

        const [popularGames, chronologyGames] = await Promise.all([
          igdbFetch<IGDBGame[]>("games", popularQuery).catch(() => []),
          igdbFetch<IGDBGame[]>("games", chronologyQuery).catch(() => []),
        ]);

        const gameMap = new Map<number, IGDBGame>();
        [...popularGames, ...chronologyGames].forEach((game) => {
          if (game.id && game.first_release_date) {
            gameMap.set(game.id, game);
          }
        });

        return Array.from(gameMap.values());
      }

      const query = `
        fields name, slug, cover.image_id, first_release_date, rating, genres.name, platforms.name, summary, hypes;
        ${whereClause};
        sort first_release_date asc;
        limit 300;
      `;

      return igdbFetch<IGDBGame[]>("games", query);
    },
    { ttl: 3600 * 6, prefix: "gsr_v7" }
  );
}
