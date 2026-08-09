import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import FriendsManager from "./FriendsManager";
import "@/app/dashboard/dashboard.css";
import "@/components/social/Social.css";

export const metadata: Metadata = {
  title: "Friends",
  description: "Manage your gamer friends and view friend requests.",
};

export default async function FriendsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/friends");
  }

  // Fetch accepted friendships
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: session.userId, status: "ACCEPTED" },
        { addresseeId: session.userId, status: "ACCEPTED" },
      ],
    },
    include: {
      requester: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, currentlyPlaying: true },
      },
      addressee: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, currentlyPlaying: true },
      },
    },
  });

  const friends = friendships.map((f) =>
    f.requesterId === session.userId ? f.addressee : f.requester
  );

  // Fetch incoming pending requests
  const pendingRequests = await prisma.friendship.findMany({
    where: {
      addresseeId: session.userId,
      status: "PENDING",
    },
    include: {
      requester: {
        select: { id: true, username: true, displayName: true, avatarUrl: true, currentlyPlaying: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="social-page" id="friends-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            Gamer <span className="dashboard-welcome__name">Friends</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Connect with friends, share tier lists, and check out recent activity.
          </p>
        </div>

        <FriendsManager
          friends={friends}
          pendingRequests={pendingRequests}
          currentUserId={session.userId}
        />
      </div>
    </div>
  );
}
