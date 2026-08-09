import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getGameById } from "@/lib/igdb";
import TierListEditor from "@/components/tierlist/TierListEditor";

interface EditTierListPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Tier List",
  description: "Edit your custom tier list.",
};

export default async function EditTierListPage({ params }: EditTierListPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/login?redirect=/tier-list/${id}/edit`);
  }

  let rawList;
  try {
    rawList = await prisma.tierList.findUnique({
      where: { id },
      include: { items: true },
    });
  } catch {
    rawList = null;
  }

  if (!rawList || rawList.userId !== session.userId) {
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
        id: item.gameIgdbId,
        name: gameData?.name || `Game #${item.gameIgdbId}`,
        slug: gameData?.slug || "",
        coverUrl: gameData?.cover?.image_id || null,
        tierLabel: item.tierLabel,
        position: item.position,
      };
    })
  );

  const initialData = {
    id: rawList.id,
    title: rawList.title,
    description: rawList.description,
    visibility: rawList.visibility as "PRIVATE" | "FRIENDS" | "PUBLIC",
    tiersConfig: (rawList.tiersConfig as any) || [],
    items: enrichedItems,
  };

  return (
    <div className="container">
      <TierListEditor initialData={initialData} />
    </div>
  );
}
