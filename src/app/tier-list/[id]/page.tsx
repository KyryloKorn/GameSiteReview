import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getGameById } from "@/lib/igdb";
import TierListViewer from "@/components/tierlist/TierListViewer";

interface TierListPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TierListPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const list = await prisma.tierList.findUnique({
      where: { id },
      select: { title: true, description: true },
    });
    if (!list) return { title: "Tier List Not Found" };
    return {
      title: list.title,
      description: list.description || "View custom game tier list on GameRank.",
    };
  } catch {
    return { title: "Tier List" };
  }
}

export default async function TierListPage({ params }: TierListPageProps) {
  const { id } = await params;
  const session = await getSession();

  let rawList;
  try {
    rawList = await prisma.tierList.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        items: true,
      },
    });
  } catch {
    rawList = null;
  }

  if (!rawList) {
    notFound();
  }

  // Check private access permissions
  if (rawList.visibility === "PRIVATE" && rawList.userId !== session?.userId) {
    notFound();
  }

  // Enrich tier items with IGDB game data
  const enrichedItems = await Promise.all(
    rawList.items.map(async (item) => {
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

  const tierList = {
    ...rawList,
    tiersConfig: (rawList.tiersConfig as any) || [],
    items: enrichedItems,
  };

  return (
    <div className="container">
      <TierListViewer tierList={tierList} currentUserId={session?.userId} />
    </div>
  );
}
