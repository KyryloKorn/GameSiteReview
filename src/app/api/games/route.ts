import { NextRequest } from "next/server";
import { searchGames, getGenres, getPlatforms } from "@/lib/igdb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const query = searchParams.get("q") || undefined;
    const genre = searchParams.get("genre");
    const platform = searchParams.get("platform");
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const sort = searchParams.get("sort") || "total_rating desc";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await searchGames({
      query,
      genres: genre ? genre.split(",").map(Number) : undefined,
      platforms: platform ? platform.split(",").map(Number) : undefined,
      yearFrom: yearFrom ? parseInt(yearFrom) : 1999,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      sort,
      limit,
      offset,
    });

    return Response.json(result);
  } catch (error) {
    console.error("[API /games] Error:", error);
    return Response.json(
      { error: "Failed to fetch games. Make sure IGDB credentials are configured." },
      { status: 500 }
    );
  }
}

// Also serve genres and platforms as a metadata sub-route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === "genres") {
      const genres = await getGenres();
      return Response.json({ genres });
    }

    if (body.type === "platforms") {
      const platforms = await getPlatforms();
      return Response.json({ platforms });
    }

    return Response.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[API /games POST] Error:", error);
    return Response.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}
