import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.userId } },
          {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        currentlyPlaying: true,
      },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET /api/users/search] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
