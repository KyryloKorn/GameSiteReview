"use client";

import { useActionState, useState } from "react";
import { createOrUpdateReview as saveReviewAction } from "@/app/actions/reviews";
import "./Review.css";

interface ReviewFormProps {
  gameIgdbId: number;
  gameSlug: string;
  existingReview?: {
    id: string;
    scoreOverall: number | null;
    scoreGameplay: number | null;
    scoreStory: number | null;
    scoreGraphics: number | null;
    scoreSound: number | null;
    scoreReplayability: number | null;
    content: string | null;
    visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
    containsSpoilers: boolean;
  } | null;
  onCancel?: () => void;
}

export default function ReviewForm({
  gameIgdbId,
  gameSlug,
  existingReview,
  onCancel,
}: ReviewFormProps) {
  const [state, action, pending] = useActionState(saveReviewAction, undefined);

  // Form State
  const [scoreOverall, setScoreOverall] = useState<number>(existingReview?.scoreOverall || 8);
  const [showSubScores, setShowSubScores] = useState<boolean>(
    Boolean(
      existingReview?.scoreGameplay ||
        existingReview?.scoreStory ||
        existingReview?.scoreGraphics ||
        existingReview?.scoreSound ||
        existingReview?.scoreReplayability
    )
  );

  const [scoreGameplay, setScoreGameplay] = useState<number>(existingReview?.scoreGameplay || 8);
  const [scoreStory, setScoreStory] = useState<number>(existingReview?.scoreStory || 8);
  const [scoreGraphics, setScoreGraphics] = useState<number>(existingReview?.scoreGraphics || 8);
  const [scoreSound, setScoreSound] = useState<number>(existingReview?.scoreSound || 8);
  const [scoreReplayability, setScoreReplayability] = useState<number>(existingReview?.scoreReplayability || 8);

  const [content, setContent] = useState<string>(existingReview?.content || "");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FRIENDS" | "PUBLIC">(
    existingReview?.visibility || "PUBLIC"
  );
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(
    existingReview?.containsSpoilers || false
  );

  return (
    <form action={action} className="review-form glass-card" id="review-form">
      <input type="hidden" name="gameIgdbId" value={gameIgdbId} />
      <input type="hidden" name="gameSlug" value={gameSlug} />

      <h3 className="review-form__title">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      {/* Global alert */}
      {state?.message && (
        <div
          className={`review-form__alert ${
            state.success ? "review-form__alert--success" : "review-form__alert--error"
          }`}
        >
          {state.success ? "✅ " : "⚠️ "} {state.message}
        </div>
      )}

      {/* Overall Score (1 - 10) */}
      <div className="review-form__field">
        <label className="review-form__label">
          Overall Score: <span className="review-form__score-badge">{scoreOverall} / 10</span>
        </label>
        <div className="review-form__score-selector">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              className={`review-form__score-btn ${
                scoreOverall === num ? "review-form__score-btn--active" : ""
              }`}
              onClick={() => setScoreOverall(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <input type="hidden" name="scoreOverall" value={scoreOverall} />
      </div>

      {/* Sub-scores Toggle */}
      <div className="review-form__subscore-toggle">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setShowSubScores(!showSubScores)}
        >
          {showSubScores ? "− Hide Detailed Category Scores" : "+ Add Category Sub-Scores (Gameplay, Story, etc.)"}
        </button>
      </div>

      {/* Sub-scores (Optional) */}
      {showSubScores && (
        <div className="review-form__subscores-grid">
          {/* Gameplay */}
          <div className="review-form__subscore-item">
            <div className="review-form__subscore-header">
              <span>Gameplay</span>
              <span>{scoreGameplay}/10</span>
            </div>
            <input
              type="range"
              name="scoreGameplay"
              min="1"
              max="10"
              value={scoreGameplay}
              onChange={(e) => setScoreGameplay(Number(e.target.value))}
              className="review-form__range"
            />
          </div>

          {/* Story */}
          <div className="review-form__subscore-item">
            <div className="review-form__subscore-header">
              <span>Story</span>
              <span>{scoreStory}/10</span>
            </div>
            <input
              type="range"
              name="scoreStory"
              min="1"
              max="10"
              value={scoreStory}
              onChange={(e) => setScoreStory(Number(e.target.value))}
              className="review-form__range"
            />
          </div>

          {/* Graphics */}
          <div className="review-form__subscore-item">
            <div className="review-form__subscore-header">
              <span>Graphics</span>
              <span>{scoreGraphics}/10</span>
            </div>
            <input
              type="range"
              name="scoreGraphics"
              min="1"
              max="10"
              value={scoreGraphics}
              onChange={(e) => setScoreGraphics(Number(e.target.value))}
              className="review-form__range"
            />
          </div>

          {/* Sound */}
          <div className="review-form__subscore-item">
            <div className="review-form__subscore-header">
              <span>Sound & Music</span>
              <span>{scoreSound}/10</span>
            </div>
            <input
              type="range"
              name="scoreSound"
              min="1"
              max="10"
              value={scoreSound}
              onChange={(e) => setScoreSound(Number(e.target.value))}
              className="review-form__range"
            />
          </div>

          {/* Replayability */}
          <div className="review-form__subscore-item">
            <div className="review-form__subscore-header">
              <span>Replayability</span>
              <span>{scoreReplayability}/10</span>
            </div>
            <input
              type="range"
              name="scoreReplayability"
              min="1"
              max="10"
              value={scoreReplayability}
              onChange={(e) => setScoreReplayability(Number(e.target.value))}
              className="review-form__range"
            />
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="review-form__field">
        <label htmlFor="review-content" className="review-form__label">
          Review Thoughts (Optional)
        </label>
        <textarea
          id="review-content"
          name="content"
          rows={5}
          placeholder="What did you think of the game? Share gameplay feelings, story moments, performance..."
          className="input review-form__textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Options Row: Visibility & Spoilers */}
      <div className="review-form__options-row">
        {/* Visibility */}
        <div className="review-form__option">
          <label className="review-form__label-sm">Who can see this?</label>
          <div className="review-form__radio-group">
            <label className={`review-form__radio-btn ${visibility === "PUBLIC" ? "active" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="PUBLIC"
                checked={visibility === "PUBLIC"}
                onChange={() => setVisibility("PUBLIC")}
              />
              🌐 Public
            </label>
            <label className={`review-form__radio-btn ${visibility === "FRIENDS" ? "active" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="FRIENDS"
                checked={visibility === "FRIENDS"}
                onChange={() => setVisibility("FRIENDS")}
              />
              👥 Friends Only
            </label>
            <label className={`review-form__radio-btn ${visibility === "PRIVATE" ? "active" : ""}`}>
              <input
                type="radio"
                name="visibility"
                value="PRIVATE"
                checked={visibility === "PRIVATE"}
                onChange={() => setVisibility("PRIVATE")}
              />
              🔒 Private Journal
            </label>
          </div>
        </div>

        {/* Spoilers */}
        <div className="review-form__option">
          <label className="review-form__checkbox-label">
            <input
              type="checkbox"
              name="containsSpoilers"
              value="true"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
            />
            ⚠️ Contains Spoilers
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="review-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Saving Review..." : existingReview ? "Update Review" : "Post Review"}
        </button>
      </div>
    </form>
  );
}
