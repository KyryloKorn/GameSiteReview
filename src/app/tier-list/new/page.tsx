import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import TierListEditor from "@/components/tierlist/TierListEditor";

export const metadata: Metadata = {
  title: "Create Tier List",
  description: "Create your custom game tier list.",
};

export default async function NewTierListPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/tier-list/new");
  }

  return (
    <div className="container">
      <TierListEditor />
    </div>
  );
}
