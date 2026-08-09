import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameBySlug, igdbImageUrl } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import GameCard from "@/components/game/GameCard";
import ReviewList from "@/components/review/ReviewList";
import GameStatusButton from "@/components/library/GameStatusButton";
import "./game-detail.css";

interface GameDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game Not Found" };

  return {
    title: game.name,
    description: game.summary
      ? game.summary.slice(0, 160)
      : `View details, reviews, and ratings for ${game.name} on GameRank.`,
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const session = await getSession();

  let game;
  try {
    game = await getGameBySlug(slug);
  } catch {
    game = null;
  }

  if (!game) {
    notFound();
  }

  // Fetch reviews for this game
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: {
        gameIgdbId: game.id,
        OR: [
          { visibility: "PUBLIC" },
          ...(session ? [{ userId: session.userId }] : []),
        ],
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
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("[GameDetailPage] Reviews fetch error:", err);
  }

  // Fetch user's library status for this game
  let userStatus = null;
  if (session) {
    try {
      userStatus = await prisma.gameStatus.findUnique({
        where: {
          userId_gameIgdbId: {
            userId: session.userId,
            gameIgdbId: game.id,
          },
        },
      });
    } catch (err) {
      console.error("[GameDetailPage] Status fetch error:", err);
    }
  }

  const userReview = session
    ? reviews.find((r) => r.userId === session.userId)
    : null;

  const coverUrl = game.cover?.image_id
    ? igdbImageUrl(game.cover.image_id, "720p")
    : null;

  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const rawRating = game.rating ?? game.total_rating;
  const rating = rawRating ? Math.round(rawRating) : null;

  const ratingClass =
    rating !== null
      ? rating >= 75
        ? "score-circle--high"
        : rating >= 50
          ? "score-circle--mid"
          : "score-circle--low"
      : "";

  const developers = game.involved_companies?.filter((c) => c.developer) || [];
  const publishers = game.involved_companies?.filter((c) => c.publisher) || [];

  return (
    <div className="game-detail" id="game-detail-page">
      {/* Hero Banner */}
      <div className="game-detail__hero">
        {game.screenshots?.[0]?.image_id && (
          <img
            src={igdbImageUrl(game.screenshots[0].image_id, "1080p")}
            alt={`${game.name} screenshot`}
            className="game-detail__hero-bg"
          />
        )}
        <div className="game-detail__hero-overlay" />
      </div>

      <div className="container">
        <div className="game-detail__content">
          {/* Left — Cover */}
          <div className="game-detail__cover-wrap">
            {coverUrl ? (
              <img src={coverUrl} alt={game.name} className="game-detail__cover" />
            ) : (
              <div className="game-detail__cover-placeholder">🎮</div>
            )}
          </div>

          {/* Right — Info */}
          <div className="game-detail__info">
            <h1 className="game-detail__title">{game.name}</h1>

            <div className="game-detail__meta">
              {year && <span className="game-detail__year">{year}</span>}
              {developers.length > 0 && (
                <span className="game-detail__dev">
                  by {developers.map((d) => d.company.name).join(", ")}
                </span>
              )}
            </div>

            {/* Rating & Status Action */}
            <div className="game-detail__rating-row">
              {rating !== null && (
                <>
                  <div className={`game-detail__score ${ratingClass}`}>
                    {rating}
                  </div>
                  <div className="game-detail__rating-info">
                    <span className="game-detail__rating-label">IGDB Score</span>
                    <span className="game-detail__rating-count">
                      Based on {game.total_rating_count || game.rating_count} ratings
                    </span>
                  </div>
                </>
              )}

              {/* Game Library Status Selector */}
              <GameStatusButton
                gameIgdbId={game.id}
                gameSlug={game.slug}
                initialStatus={userStatus?.status}
                isLoggedIn={Boolean(session)}
              />
            </div>

            {/* Genres & Platforms */}
            <div className="game-detail__tags">
              {game.genres?.map((g) => (
                <span key={g.id} className="badge badge--primary">
                  {g.name}
                </span>
              ))}
              {game.platforms?.map((p) => (
                <span key={p.id} className="badge badge--secondary">
                  {p.abbreviation || p.name}
                </span>
              ))}
            </div>

            {/* Summary */}
            {game.summary && (
              <div className="game-detail__summary">
                <h2 className="game-detail__section-title">About</h2>
                <p>{game.summary}</p>
              </div>
            )}

            {/* Game Modes */}
            {game.game_modes && game.game_modes.length > 0 && (
              <div className="game-detail__modes">
                <h3 className="game-detail__section-subtitle">Game Modes</h3>
                <div className="game-detail__tags">
                  {game.game_modes.map((m) => (
                    <span key={m.id} className="badge badge--accent">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publishers */}
            {publishers.length > 0 && (
              <div className="game-detail__publishers">
                <h3 className="game-detail__section-subtitle">Publisher</h3>
                <p className="game-detail__publisher-list">
                  {publishers.map((p) => p.company.name).join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewList
          gameIgdbId={game.id}
          gameSlug={game.slug}
          reviews={reviews}
          userReview={userReview}
          currentUserId={session?.userId}
        />

        {/* Screenshots */}
        {game.screenshots && game.screenshots.length > 1 && (
          <div className="game-detail__screenshots">
            <h2 className="game-detail__section-title">Screenshots</h2>
            <div className="game-detail__screenshots-grid">
              {game.screenshots.slice(0, 6).map((ss) => (
                <img
                  key={ss.id}
                  src={igdbImageUrl(ss.image_id, "screenshot_big")}
                  alt={`${game.name} screenshot`}
                  className="game-detail__screenshot"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Similar Games */}
        {game.similar_games && game.similar_games.length > 0 && (
          <div className="game-detail__similar">
            <h2 className="game-detail__section-title">Similar Games</h2>
            <div className="games-grid">
              {game.similar_games.slice(0, 6).map((sg) => (
                <GameCard
                  key={sg.id}
                  game={sg as any}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
