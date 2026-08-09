"use client";

import { useState } from "react";
import { setGameStatus, removeGameStatus } from "@/app/actions/library";
import { GameStatusValue } from "@/lib/definitions";
import "./Library.css";

const STATUS_CONFIG: Record<
  GameStatusValue,
  { label: string; icon: string; className: string }
> = {
  WANT_TO_PLAY: { label: "Want to Play", icon: "📌", className: "status--want" },
  PLAYING: { label: "Playing", icon: "🎮", className: "status--playing" },
  COMPLETED: { label: "Completed", icon: "🏆", className: "status--completed" },
  ON_HOLD: { label: "On Hold", icon: "⏸️", className: "status--hold" },
  DROPPED: { label: "Dropped", icon: "⏹️", className: "status--dropped" },
};

interface GameStatusButtonProps {
  gameIgdbId: number;
  gameSlug?: string;
  initialStatus?: GameStatusValue | null;
  isLoggedIn?: boolean;
}

export default function GameStatusButton({
  gameIgdbId,
  gameSlug,
  initialStatus,
  isLoggedIn = true,
}: GameStatusButtonProps) {
  const [currentStatus, setCurrentStatus] = useState<GameStatusValue | null>(
    initialStatus || null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (status: GameStatusValue) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    setCurrentStatus(status);
    setIsOpen(false);
    setIsUpdating(true);

    await setGameStatus(gameIgdbId, status, gameSlug);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (!isLoggedIn) return;

    setCurrentStatus(null);
    setIsOpen(false);
    setIsUpdating(true);

    await removeGameStatus(gameIgdbId, gameSlug);
    setIsUpdating(false);
  };

  const activeConfig = currentStatus ? STATUS_CONFIG[currentStatus] : null;

  return (
    <div className="game-status-btn-container" id={`status-btn-${gameIgdbId}`}>
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="status-dropdown-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        className={`game-status-btn ${
          activeConfig ? activeConfig.className : "status--add"
        } ${isUpdating ? "status--updating" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="game-status-btn__icon">
          {activeConfig ? activeConfig.icon : "➕"}
        </span>
        <span className="game-status-btn__label">
          {activeConfig ? activeConfig.label : "Add to Library"}
        </span>
        <span className="game-status-btn__arrow">▾</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="status-dropdown glass-card">
          <div className="status-dropdown__header">Set Library Status</div>
          <div className="status-dropdown__list">
            {(Object.keys(STATUS_CONFIG) as GameStatusValue[]).map((key) => {
              const cfg = STATUS_CONFIG[key];
              const isSelected = currentStatus === key;

              return (
                <button
                  key={key}
                  type="button"
                  className={`status-dropdown__item ${cfg.className} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(key)}
                >
                  <span className="status-dropdown__icon">{cfg.icon}</span>
                  <span className="status-dropdown__label">{cfg.label}</span>
                  {isSelected && <span className="status-dropdown__check">✓</span>}
                </button>
              );
            })}

            {currentStatus && (
              <button
                type="button"
                className="status-dropdown__item status-dropdown__item--remove"
                onClick={handleRemove}
              >
                <span className="status-dropdown__icon">🗑️</span>
                <span className="status-dropdown__label">Remove from Library</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
