import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getGameById } from "@/lib/igdb";
import UserReviewsList from "./UserReviewsList";
import "@/app/dashboard/dashboard.css";
import "@/components/review/Review.css";

export const metadata: Metadata = {
  title: "My Reviews",
  description: "View and manage your game reviews.",
};

export default async function UserReviewsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const rawReviews = await prisma.review.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      reactions: {
        select: {
          type: true,
          userId: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Enrich reviews with IGDB game data (titles, covers, slugs)
  const reviews = await Promise.all(
    rawReviews.map(async (review) => {
      let gameData = null;
      try {
        gameData = await getGameById(review.gameIgdbId);
      } catch {
        gameData = null;
      }

      return {
        ...review,
        game: gameData
          ? {
              id: gameData.id,
              name: gameData.name,
              slug: gameData.slug,
              coverUrl: gameData.cover?.image_id || null,
            }
          : {
              id: review.gameIgdbId,
              name: `Game #${review.gameIgdbId}`,
              slug: "",
              coverUrl: null,
            },
      };
    })
  );

  return (
    <div className="dashboard-page" id="user-reviews-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            My <span className="dashboard-welcome__name">Reviews</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Manage your game reviews and personal gaming journal.
          </p>
        </div>

        <UserReviewsList
          reviews={reviews}
          currentUserId={session.userId}
        />
      </div>
    </div>
  );
}
