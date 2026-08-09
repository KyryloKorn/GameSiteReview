"use client";

import { useState, useEffect, useRef } from "react";
import { igdbImageUrl } from "@/lib/igdb-utils";
import "./TierList.css";

interface GameSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: {
    id: number;
    name: string;
    slug: string;
    coverUrl: string | null;
  }) => void;
}

export default function GameSearchModal({
  isOpen,
  onClose,
  onSelectGame,
}: GameSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/games?q=${encodeURIComponent(query)}&limit=12`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.games || []);
      } catch {
        setError("Failed to search games.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="tier-modal-overlay" onClick={onClose}>
      <div className="tier-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="tier-modal__header">
          <h3>Add Games to Tier List</h3>
          <button className="tier-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div className="tier-modal__search">
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder="Search 200K+ games by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        <div className="tier-modal__results">
          {loading && (
            <div className="tier-modal__loading">
              <span className="auth-form__spinner" /> Searching IGDB...
            </div>
          )}

          {error && <div className="tier-modal__error">{error}</div>}

          {!loading && !error && query.trim() && results.length === 0 && (
            <div className="tier-modal__empty">No games found for &ldquo;{query}&rdquo;</div>
          )}

          {!loading &&
            results.map((game) => {
              const coverUrl = game.cover?.image_id
                ? igdbImageUrl(game.cover.image_id, "cover_small")
                : null;
              const year = game.first_release_date
                ? new Date(game.first_release_date * 1000).getFullYear()
                : null;

              return (
                <div key={game.id} className="tier-modal__item">
                  <div className="tier-modal__item-cover">
                    {coverUrl ? (
                      <img src={coverUrl} alt={game.name} />
                    ) : (
                      <span>🎮</span>
                    )}
                  </div>
                  <div className="tier-modal__item-info">
                    <span className="tier-modal__item-title">{game.name}</span>
                    {year && <span className="tier-modal__item-year">{year}</span>}
                  </div>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      onSelectGame({
                        id: game.id,
                        name: game.name,
                        slug: game.slug,
                        coverUrl: game.cover?.image_id || null,
                      });
                    }}
                  >
                    + Add
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
