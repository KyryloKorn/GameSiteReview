"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { igdbImageUrl } from "@/lib/igdb-utils";
import "./calendar.css";

interface CalendarGame {
  id: number;
  name: string;
  slug: string;
  first_release_date?: number;
  cover?: { image_id: string } | null;
  rating?: number | null;
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string }[];
  summary?: string;
}

interface CalendarClientProps {
  initialYear: number;
  initialMonth: number; // 1-12
  currentFilter?: "major" | "hyped" | "all";
  games: CalendarGame[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarClient({
  initialYear,
  initialMonth,
  currentFilter = "major",
  games,
}: CalendarClientProps) {
  const router = useRouter();

  const [hoveredGameId, setHoveredGameId] = useState<number | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<{
    dayNumber: number;
    dateString: string;
    games: CalendarGame[];
  } | null>(null);

  const handlePrevMonth = () => {
    let newMonth = initialMonth - 1;
    let newYear = initialYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    router.push(`/calendar?year=${newYear}&month=${newMonth}&filter=${currentFilter}`);
  };

  const handleNextMonth = () => {
    let newMonth = initialMonth + 1;
    let newYear = initialYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    router.push(`/calendar?year=${newYear}&month=${newMonth}&filter=${currentFilter}`);
  };

  const handleToday = () => {
    const now = new Date();
    router.push(`/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}&filter=${currentFilter}`);
  };

  const handleFilterChange = (filter: "major" | "hyped" | "all") => {
    router.push(`/calendar?year=${initialYear}&month=${initialMonth}&filter=${filter}`);
  };

  // Build Month Calendar Days
  const firstDayOfMonth = new Date(initialYear, initialMonth - 1, 1).getDay();
  const daysInMonth = new Date(initialYear, initialMonth, 0).getDate();
  const daysInPrevMonth = new Date(initialYear, initialMonth - 1, 0).getDate();

  // Group games by day of month using UTC timestamps
  const gamesByDay: Record<number, CalendarGame[]> = {};
  games.forEach((game) => {
    if (game.first_release_date) {
      const date = new Date(game.first_release_date * 1000);
      const gameYear = date.getUTCFullYear();
      const gameMonth = date.getUTCMonth() + 1;
      const day = date.getUTCDate();

      if (gameYear === initialYear && gameMonth === initialMonth) {
        if (!gamesByDay[day]) gamesByDay[day] = [];
        if (!gamesByDay[day].some((g) => g.id === game.id)) {
          gamesByDay[day].push(game);
        }
      }
    }
  });

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === initialYear && now.getMonth() + 1 === initialMonth;
  const todayDate = now.getDate();

  // Generate grid cells
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarCells.push({
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
      dayGames: [],
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      isToday: isCurrentMonth && d === todayDate,
      dayGames: gamesByDay[d] || [],
    });
  }

  // 3. Next month leading days
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let nextD = 1; nextD <= remainingCells; nextD++) {
    calendarCells.push({
      dayNumber: nextD,
      isCurrentMonth: false,
      isToday: false,
      dayGames: [],
    });
  }

  const openDayModal = (dayNumber: number, dayGames: CalendarGame[]) => {
    const monthName = MONTH_NAMES[initialMonth - 1];
    setSelectedDayModal({
      dayNumber,
      dateString: `${monthName} ${dayNumber}, ${initialYear}`,
      games: dayGames,
    });
  };

  return (
    <div className="calendar-container">
      {/* Month Navigation Header */}
      <div className="calendar-header glass-card">
        <div className="calendar-header__title-group">
          <button className="calendar-header__nav-btn" onClick={handlePrevMonth} title="Previous Month">
            ‹
          </button>
          <h2 className="calendar-header__month-title">
            {MONTH_NAMES[initialMonth - 1]} {initialYear}
          </h2>
          <button className="calendar-header__nav-btn" onClick={handleNextMonth} title="Next Month">
            ›
          </button>
        </div>

        {/* AAA / Notable Games Filter Controls */}
        <div className="game-filters__row" style={{ margin: 0 }}>
          <button
            className={`btn btn--sm ${currentFilter === "major" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => handleFilterChange("major")}
            title="Show AAA & Notable AA Releases"
            id="calendar-filter-major"
          >
            🌟 Major Releases (AAA/AA)
          </button>
          <button
            className={`btn btn--sm ${currentFilter === "all" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => handleFilterChange("all")}
            title="Show All Releases including Niche Indies"
            id="calendar-filter-all"
          >
            🌐 All Releases
          </button>
        </div>

        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <button className="btn btn--secondary btn--sm" onClick={handleToday}>
            Today
          </button>
          <span className="badge badge--accent">
            🎮 {games.length} Releases
          </span>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="calendar-grid">
        {DAY_NAMES.map((dayName) => (
          <div key={dayName} className="calendar-day-name">
            {dayName}
          </div>
        ))}

        {/* Day Cells */}
        {calendarCells.map((cell, idx) => {
          const colIndex = idx % 7; // 0=Sun, 6=Sat
          const isRightCol = colIndex >= 4;

          return (
            <div
              key={idx}
              className={`calendar-cell ${!cell.isCurrentMonth ? "calendar-cell--outside" : ""} ${cell.isToday ? "calendar-cell--today" : ""
                }`}
            >
              <div className="calendar-cell__header">
                <span className="calendar-cell__date-number">{cell.dayNumber}</span>
                {cell.dayGames.length > 0 && (
                  <span
                    className="calendar-cell__release-badge"
                    onClick={() => openDayModal(cell.dayNumber, cell.dayGames)}
                    title="Click to view all releases for this day"
                  >
                    {cell.dayGames.length} {cell.dayGames.length === 1 ? "release" : "releases"}
                  </span>
                )}
              </div>

              {/* Releases list in cell */}
              <div className="calendar-cell__items">
                {cell.dayGames.slice(0, 3).map((game) => (
                  <div
                    key={game.id}
                    className="calendar-cell__item-wrap"
                    onMouseEnter={() => setHoveredGameId(game.id)}
                    onMouseLeave={() => setHoveredGameId(null)}
                  >
                    <Link href={`/games/${game.slug}`} className="calendar-item-pill">
                      <span className="calendar-item-pill__title">🎮 {game.name}</span>
                    </Link>

                    {/* Hover Popover Tooltip */}
                    {hoveredGameId === game.id && (
                      <div className={`calendar-popover glass-card ${isRightCol ? "calendar-popover--right" : ""}`}>
                        {game.cover?.image_id ? (
                          <img
                            src={igdbImageUrl(game.cover.image_id, "cover_big")}
                            alt={game.name}
                            className="calendar-popover__cover"
                          />
                        ) : (
                          <div
                            className="calendar-popover__cover"
                            style={{
                              background: "var(--color-bg-tertiary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            🎮
                          </div>
                        )}

                        <div className="calendar-popover__info">
                          <span className="calendar-popover__title">{game.name}</span>
                          {game.platforms && game.platforms.length > 0 && (
                            <span className="calendar-popover__meta">
                              {game.platforms.slice(0, 2).map((p) => p.name).join(", ")}
                            </span>
                          )}
                          {game.genres && game.genres.length > 0 && (
                            <span className="calendar-popover__meta">
                              {game.genres.slice(0, 2).map((g) => g.name).join(", ")}
                            </span>
                          )}
                          {game.rating && (
                            <span className="badge badge--success" style={{ marginTop: "2px", width: "fit-content", fontSize: "0.6rem" }}>
                              ⭐ {Math.round(game.rating)}/100
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {cell.dayGames.length > 3 && (
                  <button
                    type="button"
                    className="calendar-more-btn"
                    onClick={() => openDayModal(cell.dayNumber, cell.dayGames)}
                  >
                    +{cell.dayGames.length - 3} more releases...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Releases Modal Popup */}
      {selectedDayModal && (
        <div className="calendar-modal-overlay" onClick={() => setSelectedDayModal(null)}>
          <div className="calendar-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal__header">
              <h3 className="calendar-modal__title">
                🎮 Releases on {selectedDayModal.dateString} ({selectedDayModal.games.length})
              </h3>
              <button
                type="button"
                className="calendar-modal__close"
                onClick={() => setSelectedDayModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="calendar-modal__body">
              {selectedDayModal.games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="calendar-modal__item"
                  onClick={() => setSelectedDayModal(null)}
                >
                  {game.cover?.image_id ? (
                    <img
                      src={igdbImageUrl(game.cover.image_id, "cover_big")}
                      alt={game.name}
                      className="calendar-modal__cover"
                    />
                  ) : (
                    <div
                      className="calendar-modal__cover"
                      style={{
                        background: "var(--color-bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      🎮
                    </div>
                  )}

                  <div className="calendar-modal__info">
                    <h4 className="calendar-modal__game-title">{game.name}</h4>
                    <div className="calendar-modal__meta">
                      {game.platforms && game.platforms.length > 0 && (
                        <span>Platforms: {game.platforms.map((p) => p.name).join(", ")}</span>
                      )}
                      {game.genres && game.genres.length > 0 && (
                        <span>• Genres: {game.genres.map((g) => g.name).join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {game.rating ? (
                    <span className="badge badge--success">⭐ {Math.round(game.rating)}/100</span>
                  ) : (
                    <span className="badge badge--primary">View Game →</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
