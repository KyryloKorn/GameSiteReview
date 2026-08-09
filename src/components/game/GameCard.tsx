import Link from "next/link";
import { igdbImageUrl } from "@/lib/igdb-utils";
import type { IGDBGame } from "@/lib/igdb";
import "./GameCard.css";

interface GameCardProps {
  game: IGDBGame;
}

export default function GameCard({ game }: GameCardProps) {
  const coverUrl = game.cover?.image_id
    ? igdbImageUrl(game.cover.image_id, "cover_big")
    : null;

  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const rawRating = game.rating ?? game.total_rating;
  const rating = rawRating ? Math.round(rawRating) : null;

  const ratingClass =
    rating !== null
      ? rating >= 75
        ? "score-circle--high"
        : rating >= 50
        ? "score-circle--mid"
        : "score-circle--low"
      : "";

  return (
    <Link
      href={`/games/${game.slug}`}
      className="game-card"
      id={`game-card-${game.id}`}
    >
      {/* Cover Image */}
      <div className="game-card__cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={game.name}
            className="game-card__image"
            loading="lazy"
          />
        ) : (
          <div className="game-card__placeholder">
            <span>🎮</span>
          </div>
        )}

        {/* Rating overlay */}
        {rating !== null && (
          <div className={`game-card__rating ${ratingClass}`}>
            {rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="game-card__info">
        <h3 className="game-card__title">{game.name}</h3>
        <div className="game-card__meta">
          {year && <span className="game-card__year">{year}</span>}
          {game.genres && game.genres.length > 0 && (
            <span className="game-card__genre">{game.genres[0].name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
