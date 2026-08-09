"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTierList } from "@/app/actions/tierlists";
import { igdbImageUrl } from "@/lib/igdb-utils";
import GameSearchModal from "./GameSearchModal";
import "./TierList.css";

export interface TierRow {
  label: string;
  color: string;
}

export interface TierGameItem {
  id: number; // igdbId
  name: string;
  slug: string;
  coverUrl: string | null;
  tierLabel: string; // "S", "A", "B", etc. or "UNRANKED"
  position: number;
}

interface TierListEditorProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
    tiersConfig: TierRow[];
    items: TierGameItem[];
  };
}

const DEFAULT_TIERS: TierRow[] = [
  { label: "S", color: "#FF7F7F" },
  { label: "A", color: "#FFBF7F" },
  { label: "B", color: "#FFDF7F" },
  { label: "C", color: "#FFFF7F" },
  { label: "D", color: "#BFFF7F" },
  { label: "F", color: "#7FDBFF" },
];

export default function TierListEditor({ initialData }: TierListEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "My Game Tier List");
  const [description, setDescription] = useState(initialData?.description || "");
  const [visibility, setVisibility] = useState<"PRIVATE" | "FRIENDS" | "PUBLIC">(
    initialData?.visibility || "PUBLIC"
  );
  const [tiers, setTiers] = useState<TierRow[]>(initialData?.tiersConfig || DEFAULT_TIERS);
  const [items, setItems] = useState<TierGameItem[]>(initialData?.items || []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMenuGameId, setActiveMenuGameId] = useState<number | null>(null);
  const [dragOverTier, setDragOverTier] = useState<string | null>(null);
  const [draggedGameId, setDraggedGameId] = useState<number | null>(null);

  // Add game from search modal
  const handleAddGame = (game: { id: number; name: string; slug: string; coverUrl: string | null }) => {
    if (items.some((i) => i.id === game.id)) return;

    const newItem: TierGameItem = {
      id: game.id,
      name: game.name,
      slug: game.slug,
      coverUrl: game.coverUrl,
      tierLabel: "UNRANKED",
      position: items.filter((i) => i.tierLabel === "UNRANKED").length,
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Move game to target tier
  const moveGameToTier = (gameId: number, targetTierLabel: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === gameId) {
          const countInTarget = prev.filter((i) => i.tierLabel === targetTierLabel).length;
          return { ...item, tierLabel: targetTierLabel, position: countInTarget };
        }
        return item;
      })
    );
    setActiveMenuGameId(null);
  };

  // Remove game
  const removeGame = (gameId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== gameId));
    setActiveMenuGameId(null);
  };

  // Tier Row Operations
  const handleAddTierRow = () => {
    const nextLabel = `Tier ${tiers.length + 1}`;
    const colors = ["#E0BBE4", "#957FEF", "#B76D68", "#7161EF", "#DEC0F1"];
    const color = colors[tiers.length % colors.length];
    setTiers([...tiers, { label: nextLabel, color }]);
  };

  const handleUpdateTierLabel = (index: number, newLabel: string) => {
    const oldLabel = tiers[index].label;
    const updated = [...tiers];
    updated[index].label = newLabel;
    setTiers(updated);

    setItems((prev) =>
      prev.map((item) => (item.tierLabel === oldLabel ? { ...item, tierLabel: newLabel } : item))
    );
  };

  const handleUpdateTierColor = (index: number, newColor: string) => {
    const updated = [...tiers];
    updated[index].color = newColor;
    setTiers(updated);
  };

  const handleDeleteTierRow = (index: number) => {
    const label = tiers[index].label;
    setItems((prev) =>
      prev.map((item) => (item.tierLabel === label ? { ...item, tierLabel: "UNRANKED" } : item))
    );
    setTiers(tiers.filter((_, i) => i !== index));
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, gameId: number) => {
    e.dataTransfer.setData("text/plain", gameId.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedGameId(gameId);
  };

  const handleDragOver = (e: React.DragEvent, targetTierLabel: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverTier !== targetTierLabel) {
      setDragOverTier(targetTierLabel);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTier(null);
  };

  const handleDrop = (e: React.DragEvent, targetTierLabel: string) => {
    e.preventDefault();
    const gameIdStr = e.dataTransfer.getData("text/plain");
    const gameId = Number(gameIdStr) || draggedGameId;

    if (gameId) {
      moveGameToTier(gameId, targetTierLabel);
    }
    setDragOverTier(null);
    setDraggedGameId(null);
  };

  // Save to Server
  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter a title for your tier list.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      id: initialData?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      visibility,
      tiersConfig: tiers,
      items: items
        .filter((i) => i.tierLabel !== "UNRANKED")
        .map((i) => ({
          gameIgdbId: i.id,
          tierLabel: i.tierLabel,
          position: i.position,
        })),
    };

    const res = await saveTierList(payload);

    if (res?.tierListId) {
      router.push(`/tier-list/${res.tierListId}`);
    } else {
      setErrorMessage(res?.message || "Failed to save tier list.");
      setIsSaving(false);
    }
  };

  const unrankedItems = items.filter((i) => i.tierLabel === "UNRANKED");

  return (
    <div className="tier-editor" id="tier-editor">
      {/* Backdrop for active dropdown menu */}
      {activeMenuGameId && (
        <div
          className="tier-dropdown-backdrop"
          onClick={() => setActiveMenuGameId(null)}
        />
      )}

      {/* Top Header Controls */}
      <div className="tier-editor__meta glass-card">
        <div className="tier-editor__field">
          <label className="review-form__label">Tier List Title</label>
          <input
            type="text"
            className="input tier-editor__title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Best RPGs of All Time"
            required
          />
        </div>

        <div className="tier-editor__field">
          <label className="review-form__label">Description (Optional)</label>
          <textarea
            className="input tier-editor__desc-input"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or criteria for your tier list..."
          />
        </div>

        <div className="tier-editor__row">
          {/* Visibility */}
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
              🔒 Private
            </label>
          </div>

          <div className="tier-editor__actions">
            <button
              className="btn btn--secondary"
              onClick={() => setIsSearchOpen(true)}
              id="btn-add-game"
            >
              ➕ Search & Add Game
            </button>

            <button
              className="btn btn--primary"
              onClick={handleSave}
              disabled={isSaving}
              id="btn-save-tier-list"
            >
              {isSaving ? "Saving..." : "Save Tier List"}
            </button>
          </div>
        </div>

        {errorMessage && <div className="review-form__alert review-form__alert--error">{errorMessage}</div>}

        {/* Intuitive User Tip Banner */}
        <div className="tier-editor__tip">
          💡 <strong>How to rank:</strong> Drag & drop any game cover directly into a tier row, or click the <strong>⋮ menu</strong> on a game card to pick a tier!
        </div>
      </div>

      {/* Tier Rows Board */}
      <div className="tier-board">
        {tiers.map((tier, idx) => {
          const tierGames = items.filter((i) => i.tierLabel === tier.label);
          const isDragTarget = dragOverTier === tier.label;

          return (
            <div key={tier.label} className="tier-row">
              {/* Row Header */}
              <div className="tier-row__header" style={{ backgroundColor: tier.color }}>
                <input
                  type="text"
                  className="tier-row__label-input"
                  value={tier.label}
                  onChange={(e) => handleUpdateTierLabel(idx, e.target.value)}
                />
                <div className="tier-row__controls">
                  <input
                    type="color"
                    className="tier-row__color-picker"
                    value={tier.color}
                    onChange={(e) => handleUpdateTierColor(idx, e.target.value)}
                    title="Change Tier Color"
                  />
                  <button
                    className="tier-row__delete-btn"
                    onClick={() => handleDeleteTierRow(idx)}
                    title="Delete Tier Row"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Row Drop Zone & Items */}
              <div
                className={`tier-row__content ${isDragTarget ? "tier-row__content--drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, tier.label)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tier.label)}
              >
                {tierGames.map((game) => (
                  <div
                    key={game.id}
                    className={`tier-game-card ${draggedGameId === game.id ? "tier-game-card--dragging" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, game.id)}
                  >
                    <div className="tier-game-card__cover">
                      {game.coverUrl ? (
                        <img src={igdbImageUrl(game.coverUrl, "cover_small")} alt={game.name} draggable={false} />
                      ) : (
                        <div className="tier-game-card__placeholder">🎮</div>
                      )}
                    </div>
                    <span className="tier-game-card__title" title={game.name}>{game.name}</span>

                    {/* Quick Move Menu Button */}
                    <button
                      type="button"
                      className="tier-game-card__menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuGameId(activeMenuGameId === game.id ? null : game.id);
                      }}
                      title="Move game..."
                    >
                      ⋮
                    </button>

                    {/* Move Dropdown Menu */}
                    {activeMenuGameId === game.id && (
                      <div className="tier-game-card__dropdown" onClick={(e) => e.stopPropagation()}>
                        <div className="tier-game-card__dropdown-header">Move to:</div>
                        <div className="tier-game-card__dropdown-list">
                          {tiers.map((t) => (
                            <button
                              key={t.label}
                              type="button"
                              className={`tier-game-card__dropdown-item ${game.tierLabel === t.label ? "active" : ""}`}
                              onClick={() => moveGameToTier(game.id, t.label)}
                            >
                              <span
                                className="tier-game-card__dropdown-color"
                                style={{ backgroundColor: t.color }}
                              />
                              <span className="tier-game-card__dropdown-name">{t.label} Tier</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            className="tier-game-card__dropdown-item"
                            onClick={() => moveGameToTier(game.id, "UNRANKED")}
                          >
                            <span>📦</span> Unranked Pool
                          </button>
                          <button
                            type="button"
                            className="tier-game-card__dropdown-item danger"
                            onClick={() => removeGame(game.id)}
                          >
                            <span>🗑️</span> Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {tierGames.length === 0 && (
                  <span className="tier-row__empty-hint">
                    {isDragTarget ? "Drop game here!" : "Drag games here or click ⋮ menu"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Row Button */}
      <div className="tier-editor__add-row-wrap">
        <button className="btn btn--ghost" onClick={handleAddTierRow}>
          ➕ Add Tier Row
        </button>
      </div>

      {/* Unranked Games Pool Drop Zone */}
      <div className="tier-unranked glass-card">
        <h4 className="tier-unranked__title">
          📦 Unranked Games Pool ({unrankedItems.length})
        </h4>
        <div
          className={`tier-row__content ${dragOverTier === "UNRANKED" ? "tier-row__content--drag-over" : ""}`}
          onDragOver={(e) => handleDragOver(e, "UNRANKED")}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, "UNRANKED")}
        >
          {unrankedItems.map((game) => (
            <div
              key={game.id}
              className={`tier-game-card ${draggedGameId === game.id ? "tier-game-card--dragging" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, game.id)}
            >
              <div className="tier-game-card__cover">
                {game.coverUrl ? (
                  <img src={igdbImageUrl(game.coverUrl, "cover_small")} alt={game.name} draggable={false} />
                ) : (
                  <div className="tier-game-card__placeholder">🎮</div>
                )}
              </div>
              <span className="tier-game-card__title" title={game.name}>{game.name}</span>

              <button
                type="button"
                className="tier-game-card__menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuGameId(activeMenuGameId === game.id ? null : game.id);
                }}
                title="Move game..."
              >
                ⋮
              </button>

              {activeMenuGameId === game.id && (
                <div className="tier-game-card__dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="tier-game-card__dropdown-header">Move to:</div>
                  <div className="tier-game-card__dropdown-list">
                    {tiers.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        className="tier-game-card__dropdown-item"
                        onClick={() => moveGameToTier(game.id, t.label)}
                      >
                        <span
                          className="tier-game-card__dropdown-color"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="tier-game-card__dropdown-name">{t.label} Tier</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="tier-game-card__dropdown-item danger"
                      onClick={() => removeGame(game.id)}
                    >
                      <span>🗑️</span> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {unrankedItems.length === 0 && (
            <p className="tier-unranked__empty">
              No unranked games. Click <strong>Search & Add Game</strong> above to add games to your list!
            </p>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <GameSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectGame={(game) => {
          handleAddGame(game);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
