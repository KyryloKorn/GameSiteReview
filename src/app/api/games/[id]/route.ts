import { getGameById } from "@/lib/igdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const igdbId = parseInt(id);

    if (isNaN(igdbId)) {
      return Response.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const game = await getGameById(igdbId);

    if (!game) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }

    return Response.json(game);
  } catch (error) {
    console.error("[API /games/[id]] Error:", error);
    return Response.json(
      { error: "Failed to fetch game details" },
      { status: 500 }
    );
  }
}
