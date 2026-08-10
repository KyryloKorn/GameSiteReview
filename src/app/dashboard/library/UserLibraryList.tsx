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

const ITEMS_PER_PAGE = 50;

export default function UserLibraryList({ items }: UserLibraryListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const countAll = items.length;
  const countPlaying = items.filter((i) => i.status === "PLAYING").length;
  const countWant = items.filter((i) => i.status === "WANT_TO_PLAY").length;
  const countCompleted = items.filter((i) => i.status === "COMPLETED").length;
  const countHold = items.filter((i) => i.status === "ON_HOLD").length;
  const countDropped = items.filter((i) => i.status === "DROPPED").length;

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      item.game.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onClick={() => handleTabChange("ALL")}
          >
            All ({countAll})
          </button>
          <button
            className={`btn ${activeTab === "PLAYING" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => handleTabChange("PLAYING")}
          >
            🎮 Playing ({countPlaying})
          </button>
          <button
            className={`btn ${activeTab === "WANT_TO_PLAY" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => handleTabChange("WANT_TO_PLAY")}
          >
            📌 Want to Play ({countWant})
          </button>
          <button
            className={`btn ${activeTab === "COMPLETED" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => handleTabChange("COMPLETED")}
          >
            🏆 Completed ({countCompleted})
          </button>
          <button
            className={`btn ${activeTab === "ON_HOLD" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => handleTabChange("ON_HOLD")}
          >
            ⏸️ On Hold ({countHold})
          </button>
          <button
            className={`btn ${activeTab === "DROPPED" ? "btn--primary" : "btn--secondary"} btn--sm`}
            onClick={() => handleTabChange("DROPPED")}
          >
            ⏹️ Dropped ({countDropped})
          </button>

          <input
            type="text"
            className="input"
            style={{ width: "220px", padding: "var(--space-2) var(--space-3)", marginLeft: "auto" }}
            placeholder="Filter library games..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Results Header Info */}
      {filteredItems.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            Showing {startIndex + 1}–{endIndex} of {filteredItems.length} games
          </span>
          {totalPages > 1 && (
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Library Grid */}
      {paginatedItems.length > 0 ? (
        <>
          <div className="library-grid">
            {paginatedItems.map((item) => (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: "var(--space-8)" }}>
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹ Previous
              </button>

              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn--sm ${p === currentPage ? "btn--primary" : "btn--ghost"}`}
                    onClick={() => handlePageChange(p)}
                    style={{ minWidth: "36px" }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                className="btn btn--secondary btn--sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </>
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
