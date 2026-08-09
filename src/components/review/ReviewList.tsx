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
}

export default function ReviewList({
  gameIgdbId,
  gameSlug,
  reviews,
  userReview,
  currentUserId,
}: ReviewListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isWritingNew, setIsWritingNew] = useState(false);

  // Compute average ratings
  const count = reviews.length;
  const avgOverall = count
    ? (reviews.reduce((acc, r) => acc + (r.scoreOverall || 0), 0) / count).toFixed(1)
    : null;

  return (
    <div className="review-list-section" id="reviews-section">
      <div className="review-list__header">
        <div className="review-list__summary">
          <h2 className="review-list__title">Community Reviews</h2>
          {avgOverall && (
            <div className="review-list__avg-badge">
              <span className="review-list__avg-score">{avgOverall}</span>
              <span className="review-list__avg-max">/10</span>
              <span className="review-list__avg-count">({count} {count === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>

        {currentUserId && !userReview && !isWritingNew && (
          <button
            className="btn btn--primary"
            onClick={() => setIsWritingNew(true)}
            id="btn-write-review"
          >
            ✏️ Write a Review
          </button>
        )}
      </div>

      {/* New Review Form */}
      {isWritingNew && (
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
        <div className="review-list__user-review">
          <h3 className="review-list__sub-title">Your Review</h3>
          <ReviewCard
            review={userReview}
            currentUserId={currentUserId}
            gameSlug={gameSlug}
            onEdit={() => setIsEditing(true)}
          />
        </div>
      )}

      {/* Community Reviews */}
      <div className="review-list__community">
        {reviews.length > 0 ? (
          <div className="review-list__grid">
            {reviews
              .filter((r) => r.id !== userReview?.id)
              .map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={currentUserId}
                  gameSlug={gameSlug}
                />
              ))}
          </div>
        ) : (
          !userReview &&
          !isWritingNew && (
            <div className="review-list__empty glass-card">
              <div className="review-list__empty-icon">📝</div>
              <h3>No reviews yet</h3>
              <p>Be the first to share your experience with this game!</p>
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
