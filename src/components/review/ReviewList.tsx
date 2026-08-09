"use client";

import { useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import "./Review.css";

interface ReviewListProps {
  gameIgdbId: number;
  gameSlug: string;
  reviews: any[];
  userReview?: any;
  currentUserId?: string;
  friendIds?: string[];
  isUnreleased?: boolean;
  formattedReleaseDate?: string | null;
}

export default function ReviewList({
  gameIgdbId,
  gameSlug,
  reviews,
  userReview,
  currentUserId,
  friendIds = [],
  isUnreleased,
  formattedReleaseDate,
}: ReviewListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [filterTab, setFilterTab] = useState<"ALL" | "FRIENDS" | "COMMUNITY">("ALL");

  // Compute average ratings
  const count = reviews.length;
  const avgOverall = count
    ? (reviews.reduce((acc, r) => acc + (r.scoreOverall || 0), 0) / count).toFixed(1)
    : null;

  const friendReviews = reviews.filter((r) => friendIds.includes(r.userId) && r.id !== userReview?.id);
  const communityReviews = reviews.filter((r) => !friendIds.includes(r.userId) && r.id !== userReview?.id);

  const filteredReviews = reviews
    .filter((r) => r.id !== userReview?.id)
    .filter((r) => {
      if (filterTab === "FRIENDS") return friendIds.includes(r.userId);
      if (filterTab === "COMMUNITY") return !friendIds.includes(r.userId);
      return true;
    });

  return (
    <div className="review-list-section" id="reviews-section">
      {isUnreleased && (
        <div
          className="review-form__alert"
          style={{
            background: "hsla(210, 90%, 60%, 0.15)",
            color: "var(--color-info)",
            border: "1px solid hsla(210, 90%, 60%, 0.3)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-6)",
            fontSize: "var(--text-sm)",
          }}
        >
          ⏳ <strong>Upcoming Game:</strong> This game has not been released yet
          {formattedReleaseDate ? ` (Releasing ${formattedReleaseDate})` : ""}. Reviews will open once the game is officially released!
        </div>
      )}

      <div className="review-list__header">
        <div className="review-list__summary">
          <h2 className="review-list__title">Game Reviews</h2>
          {avgOverall && (
            <div className="review-list__avg-badge">
              <span className="review-list__avg-score">{avgOverall}</span>
              <span className="review-list__avg-max">/10</span>
              <span className="review-list__avg-count">({count} {count === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>

        {currentUserId && !userReview && !isWritingNew && !isUnreleased && (
          <button
            className="btn btn--primary"
            onClick={() => setIsWritingNew(true)}
            id="btn-write-review"
          >
            ✏️ Write a Review
          </button>
        )}
      </div>

      {/* Filter Tabs for Friends vs Community */}
      {reviews.length > 0 && (
        <div className="game-filters__row" style={{ marginBottom: "var(--space-6)" }}>
          <button
            className={`btn ${filterTab === "ALL" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setFilterTab("ALL")}
          >
            All Reviews ({reviews.filter((r) => r.id !== userReview?.id).length})
          </button>
          <button
            className={`btn ${filterTab === "FRIENDS" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setFilterTab("FRIENDS")}
          >
            👥 Friends ({friendReviews.length})
          </button>
          <button
            className={`btn ${filterTab === "COMMUNITY" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setFilterTab("COMMUNITY")}
          >
            🌐 Community ({communityReviews.length})
          </button>
        </div>
      )}

      {/* New Review Form */}
      {isWritingNew && !isUnreleased && (
        <div className="review-list__form-wrap">
          <ReviewForm
            gameIgdbId={gameIgdbId}
            gameSlug={gameSlug}
            onCancel={() => setIsWritingNew(false)}
          />
        </div>
      )}

      {/* Editing User Review Form */}
      {isEditing && userReview && (
        <div className="review-list__form-wrap">
          <ReviewForm
            gameIgdbId={gameIgdbId}
            gameSlug={gameSlug}
            existingReview={userReview}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* Existing User Review */}
      {userReview && !isEditing && (
        <div className="review-list__user-review" style={{ marginBottom: "var(--space-6)" }}>
          <h3 className="review-list__sub-title">Your Review</h3>
          <ReviewCard
            review={userReview}
            currentUserId={currentUserId}
            gameSlug={gameSlug}
            onEdit={() => setIsEditing(true)}
          />
        </div>
      )}

      {/* Reviews Grid */}
      <div className="review-list__community">
        {filteredReviews.length > 0 ? (
          <div className="review-list__grid">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                gameSlug={gameSlug}
                isFriend={friendIds.includes(review.userId)}
              />
            ))}
          </div>
        ) : (
          !userReview &&
          !isWritingNew && (
            <div className="review-list__empty glass-card">
              <div className="review-list__empty-icon">📝</div>
              <h3>
                {filterTab === "FRIENDS"
                  ? "No friend reviews for this game yet"
                  : "No reviews yet"}
              </h3>
              <p>
                {filterTab === "FRIENDS"
                  ? "None of your friends have reviewed this game yet."
                  : "Be the first to share your experience with this game!"}
              </p>
              {currentUserId ? (
                <button
                  className="btn btn--primary"
                  onClick={() => setIsWritingNew(true)}
                >
                  Write a Review
                </button>
              ) : (
                <p className="review-list__login-prompt">
                  <a href="/login">Log in</a> to leave a review.
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
