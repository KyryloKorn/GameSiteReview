"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleReviewReaction, deleteReview } from "@/app/actions/reviews";
import "./Review.css";

interface ReviewCardProps {
  review: {
    id: string;
    userId: string;
    gameIgdbId: number;
    scoreOverall: number | null;
    scoreGameplay: number | null;
    scoreStory: number | null;
    scoreGraphics: number | null;
    scoreSound: number | null;
    scoreReplayability: number | null;
    content: string | null;
    visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
    containsSpoilers: boolean;
    createdAt: Date;
    user: {
      username: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
    reactions?: { type: string; userId: string }[];
  };
  currentUserId?: string;
  gameSlug?: string;
  isFriend?: boolean;
  onEdit?: () => void;
}

export default function ReviewCard({
  review,
  currentUserId,
  gameSlug,
  isFriend,
  onEdit,
}: ReviewCardProps) {
  const [showSpoilers, setShowSpoilers] = useState(false);

  const isAuthor = currentUserId === review.userId;

  const likesCount = review.reactions?.filter((r) => r.type === "like").length || 0;
  const helpfulCount = review.reactions?.filter((r) => r.type === "helpful").length || 0;

  const [likes, setLikes] = useState(likesCount);
  const [helpful, setHelpful] = useState(helpfulCount);
  const [userLiked, setUserLiked] = useState(
    Boolean(currentUserId && review.reactions?.some((r) => r.userId === currentUserId && r.type === "like"))
  );
  const [userHelpful, setUserHelpful] = useState(
    Boolean(currentUserId && review.reactions?.some((r) => r.userId === currentUserId && r.type === "helpful"))
  );

  const handleReaction = async (type: "like" | "helpful") => {
    if (!currentUserId) return;

    if (type === "like") {
      setUserLiked(!userLiked);
      setLikes((prev) => (userLiked ? prev - 1 : prev + 1));
    } else {
      setUserHelpful(!userHelpful);
      setHelpful((prev) => (userHelpful ? prev - 1 : prev + 1));
    }

    await toggleReviewReaction(review.id, type);
  };

  const getScoreColorClass = (score: number | null) => {
    if (!score) return "";
    if (score >= 8) return "score-high";
    if (score >= 5) return "score-mid";
    return "score-low";
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="review-card glass-card" id={`review-${review.id}`}>
      {/* Header */}
      <div className="review-card__header">
        <div className="review-card__user">
          <div className="review-card__avatar">
            {review.user.avatarUrl ? (
              <img src={review.user.avatarUrl} alt={review.user.username} />
            ) : (
              review.user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="review-card__user-info">
            <Link href={`/user/${review.user.username}`} className="review-card__username">
              {review.user.displayName || review.user.username}
            </Link>
            <div className="review-card__meta">
              <span>{formattedDate}</span>
              {isFriend && <span className="badge badge--accent" style={{ background: "hsla(265, 90%, 60%, 0.2)", color: "var(--color-primary-light)", border: "1px solid hsla(265, 90%, 60%, 0.4)" }}>👥 Friend Review</span>}
              {review.visibility === "PRIVATE" && <span className="badge">🔒 Private</span>}
              {review.visibility === "FRIENDS" && <span className="badge">👥 Friends</span>}
            </div>
          </div>
        </div>

        {/* Overall Score Circle */}
        {review.scoreOverall !== null && (
          <div className={`review-card__score ${getScoreColorClass(review.scoreOverall)}`}>
            <span>{review.scoreOverall}</span>
            <small>/10</small>
          </div>
        )}
      </div>

      {/* Category Sub-Scores */}
      {(review.scoreGameplay ||
        review.scoreStory ||
        review.scoreGraphics ||
        review.scoreSound ||
        review.scoreReplayability) && (
        <div className="review-card__subscores">
          {review.scoreGameplay && (
            <div className="review-card__subscore-pill">
              <span>Gameplay</span>
              <strong>{review.scoreGameplay}/10</strong>
            </div>
          )}
          {review.scoreStory && (
            <div className="review-card__subscore-pill">
              <span>Story</span>
              <strong>{review.scoreStory}/10</strong>
            </div>
          )}
          {review.scoreGraphics && (
            <div className="review-card__subscore-pill">
              <span>Graphics</span>
              <strong>{review.scoreGraphics}/10</strong>
            </div>
          )}
          {review.scoreSound && (
            <div className="review-card__subscore-pill">
              <span>Sound</span>
              <strong>{review.scoreSound}/10</strong>
            </div>
          )}
          {review.scoreReplayability && (
            <div className="review-card__subscore-pill">
              <span>Replayability</span>
              <strong>{review.scoreReplayability}/10</strong>
            </div>
          )}
        </div>
      )}

      {/* Review Content */}
      {review.content && (
        <div className="review-card__body">
          {review.containsSpoilers && !showSpoilers ? (
            <div className="review-card__spoiler-overlay">
              <span className="review-card__spoiler-icon">⚠️</span>
              <p>This review contains spoilers for this game.</p>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setShowSpoilers(true)}
              >
                Reveal Review
              </button>
            </div>
          ) : (
            <p className="review-card__text">{review.content}</p>
          )}
        </div>
      )}

      {/* Footer / Actions */}
      <div className="review-card__footer">
        <div className="review-card__reactions">
          <button
            type="button"
            className={`review-card__reaction-btn ${userLiked ? "active" : ""}`}
            onClick={() => handleReaction("like")}
            disabled={!currentUserId}
          >
            👍 <span>{likes}</span>
          </button>

          <button
            type="button"
            className={`review-card__reaction-btn ${userHelpful ? "active" : ""}`}
            onClick={() => handleReaction("helpful")}
            disabled={!currentUserId}
          >
            💡 Helpful <span>{helpful}</span>
          </button>
        </div>

        {isAuthor && (
          <div className="review-card__author-actions">
            {onEdit && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={onEdit}>
                Edit
              </button>
            )}
            <form action={deleteReview}>
              <input type="hidden" name="reviewId" value={review.id} />
              {gameSlug && <input type="hidden" name="gameSlug" value={gameSlug} />}
              <button type="submit" className="btn btn--ghost btn--sm review-card__delete-btn">
                Delete
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
