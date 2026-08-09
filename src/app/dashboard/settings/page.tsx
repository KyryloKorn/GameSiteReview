import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import "@/app/dashboard/dashboard.css";
import "@/components/review/Review.css";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Update your profile, avatar, email, and password.",
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/dashboard/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      currentlyPlaying: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="dashboard-page" id="settings-page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1 className="dashboard-welcome__title">
            Account <span className="dashboard-welcome__name">Settings</span>
          </h1>
          <p className="dashboard-welcome__subtitle">
            Manage your avatar, email address, password, and public gamer profile.
          </p>
        </div>

        <SettingsForm user={user} />
      </div>
    </div>
  );
}
