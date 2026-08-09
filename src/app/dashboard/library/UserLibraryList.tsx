"use client";

import { useState } from "react";
import Link from "next/link";
import GameStatusButton from "@/components/library/GameStatusButton";
import { igdbImageUrl } from "@/lib/igdb-utils";
import { GameStatusValue } from "@/lib/definitions";

interface UserLibraryListProps {
  items: any[];
}

type FilterTab = "ALL" | GameStatusValue;

export default function UserLibraryList({ items }: UserLibraryListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const countAll = items.length;
  const countPlaying = items.filter((i) => i.status === "PLAYING").length;
  const countWant = items.filter((i) => i.status === "WANT_TO_PLAY").length;
  const countCompleted = items.filter((i) => i.status === "COMPLETED").length;
  const countHold = items.filter((i) => i.status === "ON_HOLD").length;
  const countDropped = items.filter((i) => i.status === "DROPPED").length;

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      item.game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="user-library-list">
      {/* Quick Stats Grid */}
      <div className="dashboard-stats">
        <div className="dashboard-stat glass-card">
          <div className="dashboard-stat__icon">📚</div>
          <div className="dashboard-stat__info">
            <span className="dashboard-stat__number">{countAll}</span>
            <span className="dashboard-stat__label">Total Tracked</span>
          </div>
        </div>

        <div className="dashboard-stat glass-card">
          <div className="dashboard-stat__icon">🎮</div>
          <div className="dashboard-stat__info">
            <span className="dashboard-stat__number">{countPlaying}</span>
            <span className="dashboard-stat__label">Currently Playing</span>
          </div>
        </div>

        <div className="dashboard-stat glass-card">
          <div className="dashboard-stat__icon">📌</div>
          <div className="dashboard-stat__info">
            <span className="dashboard-stat__number">{countWant}</span>
            <span className="dashboard-stat__label">Want to Play</span>
          </div>
        </div>

        <div className="dashboard-stat glass-card">
          <div className="dashboard-stat__icon">🏆</div>
          <div className="dashboard-stat__info">
            <span className="dashboard-stat__number">{countCompleted}</span>
            <span className="dashboard-stat__label">Completed</span>
          </div>
        </div>
      </div>

      {/* Controls: Search + Status Tabs */}
      <div className="game-filters" style={{ marginBottom: "var(--space-8)" }}>
        <div className="game-filters__row">
          <button
            className={`btn ${activeTab === "ALL" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("ALL")}
          >
            All ({countAll})
          </button>
          <button
            className={`btn ${activeTab === "PLAYING" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("PLAYING")}
          >
            🎮 Playing ({countPlaying})
          </button>
          <button
            className={`btn ${activeTab === "WANT_TO_PLAY" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("WANT_TO_PLAY")}
          >
            📌 Want to Play ({countWant})
          </button>
          <button
            className={`btn ${activeTab === "COMPLETED" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("COMPLETED")}
          >
            🏆 Completed ({countCompleted})
          </button>
          <button
            className={`btn ${activeTab === "ON_HOLD" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("ON_HOLD")}
          >
            ⏸️ On Hold ({countHold})
          </button>
          <button
            className={`btn ${activeTab === "DROPPED" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => setActiveTab("DROPPED")}
          >
            ⏹️ Dropped ({countDropped})
          </button>

          <input
            type="text"
            className="input"
            style={{ width: "220px", padding: "var(--space-2) var(--space-3)", marginLeft: "auto" }}
            placeholder="Filter library games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Library Grid */}
      {filteredItems.length > 0 ? (
        <div className="library-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="library-card glass-card">
              <div className="library-card__cover">
                {item.game.coverUrl ? (
                  <img src={igdbImageUrl(item.game.coverUrl, "cover_small")} alt={item.game.name} />
                ) : (
                  <div className="game-card__placeholder">🎮</div>
                )}
              </div>

              <div className="library-card__info">
                <Link
                  href={item.game.slug ? `/games/${item.game.slug}` : "#"}
                  className="library-card__title"
                  title={item.game.name}
                >
                  {item.game.name}
                </Link>

                <div className="library-card__date">
                  Updated {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>

                <div style={{ marginTop: "var(--space-2)" }}>
                  <GameStatusButton
                    gameIgdbId={item.gameIgdbId}
                    gameSlug={item.game.slug}
                    initialStatus={item.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="review-list__empty glass-card">
          <div className="review-list__empty-icon">📚</div>
          <h3>No games in this section</h3>
          <p>
            {activeTab === "ALL"
              ? "You haven't added any games to your library yet."
              : `You don't have any games marked as ${activeTab.toLowerCase().replace(/_/g, " ")}.`}
          </p>
          <Link href="/games" className="btn btn--primary">
            Browse Games Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
