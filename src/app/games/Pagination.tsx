"use client";

import Link from "next/link";
import "./games.css";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  searchParams: Record<string, string | undefined>;
  limit: number;
}

export default function Pagination({
  currentPage,
  hasMore,
  searchParams,
  limit,
}: PaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "offset") {
        params.set(key, value);
      }
    });
    if (page > 1) {
      params.set("offset", String((page - 1) * limit));
    }
    return `/games?${params.toString()}`;
  };

  if (currentPage === 1 && !hasMore) return null;

  return (
    <div className="pagination" id="games-pagination">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="btn btn--secondary btn--sm"
          id="pagination-prev"
        >
          ‹ Previous
        </Link>
      ) : (
        <button className="btn btn--secondary btn--sm" disabled>
          ‹ Previous
        </button>
      )}

      <span className="pagination__current">Page {currentPage}</span>

      {hasMore ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="btn btn--secondary btn--sm"
          id="pagination-next"
        >
          Next ›
        </Link>
      ) : (
        <button className="btn btn--secondary btn--sm" disabled>
          Next ›
        </button>
      )}
    </div>
  );
}
