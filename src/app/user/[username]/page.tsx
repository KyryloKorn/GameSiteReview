import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import ReviewCard from "@/components/review/ReviewCard";
import FriendButton from "@/components/social/FriendButton";
import "@/app/dashboard/dashboard.css";
import "@/components/social/Social.css";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { username: true, displayName: true, bio: true },
    });
    if (!user) return { title: "User Not Found" };
    return {
      title: `${user.displayName || user.username} (@${user.username})`,
      description: user.bio || `Gamer profile of ${user.displayName || user.username} on GameRank.`,
    };
  } catch {
    return { title: "Gamer Profile" };
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const session = await getSession();

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { username },
      include: {
        reviews: {
          where: { visibility: "PUBLIC" },
          include: {
            user: {
              select: { username: true, displayName: true, avatarUrl: true },
            },
            reactions: { select: { type: true, userId: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tierLists: {
          where: { visibility: "PUBLIC" },
          include: { _count: { select: { items: true } } },
          orderBy: { updatedAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            tierLists: true,
            gameStatuses: true,
          },
        },
      },
    });
  } catch {
    user = null;
  }

  if (!user) {
    notFound();
  }

  // Check friendship status if logged in
  let friendshipStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "SELF" = "NONE";
  if (session) {
    if (session.userId === user.id) {
      friendshipStatus = "SELF";
    } else {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.userId, addresseeId: user.id },
            { requesterId: user.id, addresseeId: session.userId },
          ],
        },
      });

      if (friendship) {
        if (friendship.status === "ACCEPTED") {
          friendshipStatus = "FRIENDS";
        } else if (friendship.requesterId === session.userId) {
          friendshipStatus = "PENDING_SENT";
        } else {
          friendshipStatus = "PENDING_RECEIVED";
        }
      }
    }
  }

  return (
    <div className="social-page" id="user-profile-page">
      <div className="container">
        {/* Profile Hero Banner */}
        <div className="profile-hero glass-card">
          <div className="profile-hero__avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="profile-hero__info">
            <div className="profile-hero__name-row">
              <h1 className="profile-hero__display-name">
                {user.displayName || user.username}
              </h1>
              <span className="profile-hero__username">@{user.username}</span>
            </div>

            {user.currentlyPlaying && (
              <div className="profile-hero__playing">
                🎮 Currently Playing: {user.currentlyPlaying}
              </div>
            )}

            {user.bio && <p className="profile-hero__bio">{user.bio}</p>}
          </div>

          <div className="profile-hero__actions">
            <FriendButton
              targetUsername={user.username}
              friendshipStatus={friendshipStatus}
              isLoggedIn={Boolean(session)}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="dashboard-stats" style={{ marginBottom: "var(--space-10)" }}>
          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">🎮</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">{user._count.gameStatuses}</span>
              <span className="dashboard-stat__label">Games Tracked</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">📝</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">{user._count.reviews}</span>
              <span className="dashboard-stat__label">Reviews Written</span>
            </div>
          </div>

          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">🏆</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">{user._count.tierLists}</span>
              <span className="dashboard-stat__label">Tier Lists</span>
            </div>
          </div>
        </div>

        {/* User's Public Tier Lists */}
        {user.tierLists.length > 0 && (
          <div className="dashboard-section" style={{ marginBottom: "var(--space-10)" }}>
            <h2 className="review-list__title">Public Tier Lists</h2>
            <div className="dashboard-tier-grid">
              {user.tierLists.map((list) => (
                <div key={list.id} className="dashboard-tier-card glass-card">
                  <div className="dashboard-tier-card__header">
                    <h3 className="dashboard-tier-card__title">{list.title}</h3>
                    <span className="badge badge--primary">🌐 Public</span>
                  </div>
                  {list.description && <p className="dashboard-tier-card__desc">{list.description}</p>}
                  <div className="dashboard-tier-card__meta">
                    <span>🎮 {list._count.items} Ranked Games</span>
                    <span>Updated {new Date(list.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="dashboard-tier-card__actions">
                    <Link href={`/tier-list/${list.id}`} className="btn btn--primary btn--sm">
                      View Tier List
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User's Public Reviews */}
        <div className="dashboard-section">
          <h2 className="review-list__title">Recent Reviews</h2>
          {user.reviews.length > 0 ? (
            <div className="review-list__grid" style={{ marginTop: "var(--space-4)" }}>
              {user.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={session?.userId}
                />
              ))}
            </div>
          ) : (
            <div className="review-list__empty glass-card">
              <div className="review-list__empty-icon">📝</div>
              <p>No public reviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
