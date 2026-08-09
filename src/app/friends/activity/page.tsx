import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getGameById } from "@/lib/igdb";
import { igdbImageUrl } from "@/lib/igdb-utils";
import "@/app/dashboard/dashboard.css";
import "@/components/social/Social.css";

export const metadata: Metadata = {
  title: "Friend Activity Feed",
  description: "See what games your friends are playing, reviewing, and ranking.",
};

export default async function FriendsActivityPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/friends/activity");
  }

  // Get user's friend IDs
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: session.userId, status: "ACCEPTED" },
        { addresseeId: session.userId, status: "ACCEPTED" },
      ],
    },
  });

  const friendIds = friendships.map((f) =>
    f.requesterId === session.userId ? f.addresseeId : f.requesterId
  );

  const relevantUserIds = [session.userId, ...friendIds];

  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Fetch activities from the last 48 hours (max 15 items)
  const rawActivities = await prisma.activity.findMany({
    where: {
      userId: { in: relevantUserIds },
      createdAt: { gte: twoDaysAgo },
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  // Enrich activities with IGDB game data if payload contains gameIgdbId
  const activities = await Promise.all(
    rawActivities.map(async (act) => {
      const payload = act.payload as any;
      let gameData = null;

      if (payload?.gameIgdbId) {
        try {
          gameData = await getGameById(payload.gameIgdbId);
        } catch {
          gameData = null;
        }
      }

      return {
        ...act,
        game: gameData
          ? {
              id: gameData.id,
              name: gameData.name,
              slug: gameData.slug,
              coverUrl: gameData.cover?.image_id || null,
            }
          : null,
      };
    })
  );

  return (
    <div className="social-page" id="activity-feed-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            Activity <span className="dashboard-welcome__name">Feed</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            See recent gaming activity from you and your friends.
          </p>
        </div>

        {activities.length > 0 ? (
          <div className="activity-feed">
            {activities.map((act) => {
              const timeAgo = formatTimeAgo(new Date(act.createdAt));
              const payload = act.payload as any;

              return (
                <div key={act.id} className="activity-item glass-card">
                  <div className="activity-item__avatar">
                    {act.user.avatarUrl ? (
                      <img src={act.user.avatarUrl} alt={act.user.username} />
                    ) : (
                      act.user.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="activity-item__content">
                    <div className="activity-item__header">
                      <Link href={`/user/${act.user.username}`} className="activity-item__user-link">
                        {act.user.displayName || act.user.username}
                      </Link>

                      {act.type === "REVIEW_POSTED" && (
                        <>
                          <span className="activity-item__action-text">reviewed</span>
                          {act.game && (
                            <Link href={`/games/${act.game.slug}`} className="activity-item__target-link">
                              {act.game.name}
                            </Link>
                          )}
                        </>
                      )}

                      {act.type === "TIER_LIST_UPDATED" && (
                        <>
                          <span className="activity-item__action-text">published a tier list</span>
                          <Link href={`/tier-list/${payload?.tierListId}`} className="activity-item__target-link">
                            {payload?.title || "Tier List"}
                          </Link>
                        </>
                      )}

                      {act.type === "GAME_STARTED" && (
                        <>
                          <span className="activity-item__action-text">started playing</span>
                          {act.game && (
                            <Link href={`/games/${act.game.slug}`} className="activity-item__target-link">
                              {act.game.name}
                            </Link>
                          )}
                        </>
                      )}

                      {act.type === "GAME_COMPLETED" && (
                        <>
                          <span className="activity-item__action-text">completed</span>
                          {act.game && (
                            <Link href={`/games/${act.game.slug}`} className="activity-item__target-link">
                              {act.game.name}
                            </Link>
                          )}
                        </>
                      )}

                      {act.type === "FRIEND_ADDED" && (
                        <span className="activity-item__action-text">became friends with a gamer</span>
                      )}

                      <span className="activity-item__time">{timeAgo}</span>
                    </div>

                    {/* Rich Payload Body */}
                    {act.game && (
                      <div className="activity-item__body">
                        {act.game.coverUrl && (
                          <img
                            src={igdbImageUrl(act.game.coverUrl, "cover_small")}
                            alt={act.game.name}
                            className="activity-item__game-cover"
                          />
                        )}
                        <div className="activity-item__body-info">
                          <Link href={`/games/${act.game.slug}`} className="activity-item__target-link">
                            {act.game.name}
                          </Link>
                          {payload?.scoreOverall && (
                            <span className="activity-item__score-badge">
                              ⭐ {payload.scoreOverall}/10
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="review-list__empty glass-card" style={{ maxWidth: "600px", margin: "var(--space-8) auto" }}>
            <div className="review-list__empty-icon">⚡</div>
            <h3>No activity in the last 48 hours</h3>
            <p>Add friends, write reviews, or rank games to see activity stream here!</p>
            <Link href="/friends" className="btn btn--primary">
              Find Friends
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
