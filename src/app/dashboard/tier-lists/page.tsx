import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { deleteTierList } from "@/app/actions/tierlists";
import "@/app/dashboard/dashboard.css";
import "@/components/tierlist/TierList.css";

export const metadata: Metadata = {
  title: "My Tier Lists",
  description: "View and manage your custom game tier lists.",
};

export default async function UserTierListsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const tierLists = await prisma.tierList.findMany({
    where: { userId: session.userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="dashboard-page" id="user-tier-lists-page">
      <div className="container">
        <div className="dashboard-welcome" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-4)" }}>
          <div>
            <h1 className="dashboard-welcome__title">
              My <span className="dashboard-welcome__name">Tier Lists</span>
            </h1>
            <p className="dashboard-welcome__subtitle">
              Create, organize, and share your personal game rankings.
            </p>
          </div>

          <Link href="/tier-list/new" className="btn btn--primary" id="btn-create-tier-list">
            🏆 Create New Tier List
          </Link>
        </div>

        {tierLists.length > 0 ? (
          <div className="dashboard-tier-grid">
            {tierLists.map((list) => (
              <div key={list.id} className="dashboard-tier-card glass-card">
                <div className="dashboard-tier-card__header">
                  <h3 className="dashboard-tier-card__title">{list.title}</h3>
                  {list.visibility === "PUBLIC" && <span className="badge badge--primary">🌐 Public</span>}
                  {list.visibility === "FRIENDS" && <span className="badge badge--accent">👥 Friends</span>}
                  {list.visibility === "PRIVATE" && <span className="badge">🔒 Private</span>}
                </div>

                {list.description && (
                  <p className="dashboard-tier-card__desc">{list.description}</p>
                )}

                <div className="dashboard-tier-card__meta">
                  <span>🎮 {list._count.items} Ranked Games</span>
                  <span>Updated {new Date(list.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>

                <div className="dashboard-tier-card__actions">
                  <Link href={`/tier-list/${list.id}`} className="btn btn--secondary btn--sm">
                    View
                  </Link>
                  <Link href={`/tier-list/${list.id}/edit`} className="btn btn--ghost btn--sm">
                    Edit
                  </Link>
                  <form action={deleteTierList}>
                    <input type="hidden" name="id" value={list.id} />
                    <button type="submit" className="btn btn--ghost btn--sm review-card__delete-btn">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="review-list__empty glass-card">
            <div className="review-list__empty-icon">🏆</div>
            <h3>No Tier Lists Yet</h3>
            <p>Rank your favorite games into custom S to F tiers and share with friends.</p>
            <Link href="/tier-list/new" className="btn btn--primary">
              Create Your First Tier List
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
