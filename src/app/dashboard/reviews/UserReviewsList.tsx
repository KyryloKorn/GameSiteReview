"use client";

import { useState } from "react";
import Link from "next/link";
import ReviewCard from "@/components/review/ReviewCard";
import ReviewForm from "@/components/review/ReviewForm";
import { igdbImageUrl } from "@/lib/igdb-utils";

interface UserReviewsListProps {
  reviews: any[];
  currentUserId: string;
}

export default function UserReviewsList({
  reviews,
  currentUserId,
}: UserReviewsListProps) {
  const [filter, setFilter] = useState<"ALL" | "PUBLIC" | "FRIENDS" | "PRIVATE">("ALL");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "ALL") return true;
    return r.visibility === filter;
  });

  return (
    <div className="user-reviews-list">
      {/* Visibility Filters */}
      <div className="game-filters__row" style={{ marginBottom: "var(--space-8)" }}>
        <button
          className={`btn ${filter === "ALL" ? "btn--primary" : "btn--secondary"} btn--sm`}
          onClick={() => setFilter("ALL")}
        >
          All ({reviews.length})
        </button>
        <button
          className={`btn ${filter === "PUBLIC" ? "btn--primary" : "btn--secondary"} btn--sm`}
          onClick={() => setFilter("PUBLIC")}
        >
          🌐 Public ({reviews.filter((r) => r.visibility === "PUBLIC").length})
        </button>
        <button
          className={`btn ${filter === "FRIENDS" ? "btn--primary" : "btn--secondary"} btn--sm`}
          onClick={() => setFilter("FRIENDS")}
        >
          👥 Friends Only ({reviews.filter((r) => r.visibility === "FRIENDS").length})
        </button>
        <button
          className={`btn ${filter === "PRIVATE" ? "btn--primary" : "btn--secondary"} btn--sm`}
          onClick={() => setFilter("PRIVATE")}
        >
          🔒 Private Journal ({reviews.filter((r) => r.visibility === "PRIVATE").length})
        </button>
      </div>

      {filteredReviews.length > 0 ? (
        <div className="review-list__grid">
          {filteredReviews.map((review) => (
            <div key={review.id} className="user-review-item">
              {/* Game Info Header */}
              <div className="user-review-item__game-header">
                <Link
                  href={review.game.slug ? `/games/${review.game.slug}` : "#"}
                  className="user-review-item__game-link"
                >
                  {review.game.coverUrl && (
                    <img
                      src={igdbImageUrl(review.game.coverUrl, "cover_small")}
                      alt={review.game.name}
                      className="user-review-item__cover"
                    />
                  )}
                  <span className="user-review-item__game-name">{review.game.name}</span>
                </Link>
              </div>

              {/* Editing Form or Review Card */}
              {editingReviewId === review.id ? (
                <ReviewForm
                  gameIgdbId={review.gameIgdbId}
                  gameSlug={review.game.slug}
                  existingReview={review}
                  onCancel={() => setEditingReviewId(null)}
                />
              ) : (
                <ReviewCard
                  review={review}
                  currentUserId={currentUserId}
                  gameSlug={review.game.slug}
                  onEdit={() => setEditingReviewId(review.id)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="review-list__empty glass-card">
          <div className="review-list__empty-icon">📝</div>
          <h3>No reviews found</h3>
          <p>
            {filter === "ALL"
              ? "You haven't written any game reviews yet."
              : `You don't have any ${filter.toLowerCase()} reviews.`}
          </p>
          <Link href="/games" className="btn btn--primary">
            Browse Games to Review
          </Link>
        </div>
      )}
    </div>
  );
}
