import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import "./dashboard.css";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            Welcome back, <span className="dashboard-welcome__name">{session.username}</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Here&apos;s your gaming journey at a glance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-stats">
          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">🎮</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">0</span>
              <span className="dashboard-stat__label">Games Tracked</span>
            </div>
          </div>
          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">🏆</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">0</span>
              <span className="dashboard-stat__label">Tier Lists</span>
            </div>
          </div>
          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">📝</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">0</span>
              <span className="dashboard-stat__label">Reviews</span>
            </div>
          </div>
          <div className="dashboard-stat glass-card">
            <div className="dashboard-stat__icon">👥</div>
            <div className="dashboard-stat__info">
              <span className="dashboard-stat__number">0</span>
              <span className="dashboard-stat__label">Friends</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-actions">
          <h2 className="dashboard-actions__title">Quick Actions</h2>
          <div className="dashboard-actions__grid">
            <Link href="/games" className="dashboard-action glass-card" id="action-browse-games">
              <span className="dashboard-action__icon">🔍</span>
              <span className="dashboard-action__label">Browse Games</span>
              <span className="dashboard-action__desc">Explore 200K+ titles</span>
            </Link>
            <Link href="/tier-list/new" className="dashboard-action glass-card" id="action-new-tier-list">
              <span className="dashboard-action__icon">🏆</span>
              <span className="dashboard-action__label">New Tier List</span>
              <span className="dashboard-action__desc">Rank your favorites</span>
            </Link>
            <Link href="/dashboard/library" className="dashboard-action glass-card" id="action-my-library">
              <span className="dashboard-action__icon">📚</span>
              <span className="dashboard-action__label">My Library</span>
              <span className="dashboard-action__desc">Track your collection</span>
            </Link>
            <Link href="/friends/find" className="dashboard-action glass-card" id="action-find-friends">
              <span className="dashboard-action__icon">👥</span>
              <span className="dashboard-action__label">Find Friends</span>
              <span className="dashboard-action__desc">Connect with gamers</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
