import { getTrendingGames } from "@/lib/igdb";

export async function GET() {
  try {
    const games = await getTrendingGames(20);
    return Response.json({ games });
  } catch (error) {
    console.error("[API /games/trending] Error:", error);
    return Response.json(
      { error: "Failed to fetch trending games" },
      { status: 500 }
    );
  }
}
