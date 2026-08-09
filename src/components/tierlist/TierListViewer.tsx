"use client";

import { useState } from "react";
import Link from "next/link";
import { igdbImageUrl } from "@/lib/igdb-utils";
import "./TierList.css";

interface TierRow {
  label: string;
  color: string;
}

interface TierGameItem {
  id: string;
  gameIgdbId: number;
  tierLabel: string;
  position: number;
  game: {
    id: number;
    name: string;
    slug: string;
    coverUrl: string | null;
  };
}

interface TierListViewerProps {
  tierList: {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
    tiersConfig: TierRow[];
    items: TierGameItem[];
    createdAt: Date;
    user: {
      username: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    };
  };
  currentUserId?: string;
}

export default function TierListViewer({
  tierList,
  currentUserId,
}: TierListViewerProps) {
  const [copied, setCopied] = useState(false);

  const isAuthor = currentUserId === tierList.userId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(tierList.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="tier-viewer" id="tier-viewer">
      {/* Header Info */}
      <div className="tier-viewer__header glass-card">
        <div className="tier-viewer__title-wrap">
          <h1 className="tier-viewer__title">{tierList.title}</h1>
          <div className="tier-viewer__meta">
            <Link href={`/user/${tierList.user.username}`} className="tier-viewer__author">
              <span className="tier-viewer__avatar">
                {tierList.user.avatarUrl ? (
                  <img src={tierList.user.avatarUrl} alt={tierList.user.username} />
                ) : (
                  tierList.user.username.charAt(0).toUpperCase()
                )}
              </span>
              <span>{tierList.user.displayName || tierList.user.username}</span>
            </Link>
            <span className="tier-viewer__dot">•</span>
            <span>{formattedDate}</span>
            {tierList.visibility === "PRIVATE" && <span className="badge">🔒 Private</span>}
            {tierList.visibility === "FRIENDS" && <span className="badge">👥 Friends</span>}
          </div>
          {tierList.description && (
            <p className="tier-viewer__desc">{tierList.description}</p>
          )}
        </div>

        <div className="tier-viewer__actions">
          <button className="btn btn--secondary btn--sm" onClick={handleShare}>
            {copied ? "✓ Link Copied!" : "🔗 Share"}
          </button>
          {isAuthor && (
            <Link href={`/tier-list/${tierList.id}/edit`} className="btn btn--primary btn--sm">
              ✏️ Edit List
            </Link>
          )}
        </div>
      </div>

      {/* Tier Board View */}
      <div className="tier-board">
        {tierList.tiersConfig.map((tier) => {
          const tierItems = tierList.items
            .filter((item) => item.tierLabel === tier.label)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={tier.label} className="tier-row">
              <div className="tier-row__header" style={{ backgroundColor: tier.color }}>
                <span className="tier-row__label-text">{tier.label}</span>
              </div>
              <div className="tier-row__content">
                {tierItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.game.slug ? `/games/${item.game.slug}` : "#"}
                    className="tier-game-card tier-game-card--link"
                    title={item.game.name}
                  >
                    {item.game.coverUrl ? (
                      <img src={igdbImageUrl(item.game.coverUrl, "cover_small")} alt={item.game.name} />
                    ) : (
                      <div className="tier-game-card__placeholder">🎮</div>
                    )}
                    <span className="tier-game-card__title">{item.game.name}</span>
                  </Link>
                ))}
                {tierItems.length === 0 && (
                  <span className="tier-row__empty-hint">Empty tier</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
