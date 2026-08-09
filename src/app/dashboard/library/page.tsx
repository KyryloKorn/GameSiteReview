import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getGameById } from "@/lib/igdb";
import UserLibraryList from "@/app/dashboard/library/UserLibraryList";
import "@/app/dashboard/dashboard.css";
import "@/components/library/Library.css";

export const metadata: Metadata = {
  title: "My Game Library",
  description: "Track your gaming collection, games playing, want to play, and completed.",
};

export default async function UserLibraryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const rawStatuses = await prisma.gameStatus.findMany({
    where: { userId: session.userId },
    orderBy: { updatedAt: "desc" },
  });

  // Enrich with IGDB game info (name, slug, coverUrl)
  const items = await Promise.all(
    rawStatuses.map(async (item) => {
      let gameData = null;
      try {
        gameData = await getGameById(item.gameIgdbId);
      } catch {
        gameData = null;
      }

      return {
        ...item,
        game: gameData
          ? {
              id: gameData.id,
              name: gameData.name,
              slug: gameData.slug,
              coverUrl: gameData.cover?.image_id || null,
            }
          : {
              id: item.gameIgdbId,
              name: `Game #${item.gameIgdbId}`,
              slug: "",
              coverUrl: null,
            },
      };
    })
  );

  return (
    <div className="dashboard-page" id="user-library-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            My <span className="dashboard-welcome__name">Library</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Track your gaming progress, backlog, and completed collection.
          </p>
        </div>

        <UserLibraryList items={items} />
      </div>
    </div>
  );
}
