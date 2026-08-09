"use client";

import { useState } from "react";
import Link from "next/link";
import { sendFriendRequest, removeFriend } from "@/app/actions/social";
import "@/components/social/Social.css";

interface FriendButtonProps {
  targetUsername: string;
  friendshipStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "FRIENDS" | "SELF";
  isLoggedIn: boolean;
}

export default function FriendButton({
  targetUsername,
  friendshipStatus: initialStatus,
  isLoggedIn,
}: FriendButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  if (status === "SELF") {
    return (
      <Link href="/dashboard" className="btn btn--secondary">
        ⚙️ Dashboard
      </Link>
    );
  }

  const handleAdd = async () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    setStatus("PENDING_SENT");
    setLoading(true);

    await sendFriendRequest(targetUsername);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (confirm("Remove friend?")) {
      setStatus("NONE");
      setLoading(true);
      await removeFriend(targetUsername);
      setLoading(false);
    }
  };

  if (status === "FRIENDS") {
    return (
      <button
        className="btn btn--secondary"
        onClick={handleRemove}
        disabled={loading}
        title="Click to remove friend"
      >
        ✓ Friends
      </button>
    );
  }

  if (status === "PENDING_SENT") {
    return (
      <button className="btn btn--secondary" disabled>
        📩 Request Sent
      </button>
    );
  }

  if (status === "PENDING_RECEIVED") {
    return (
      <Link href="/friends" className="btn btn--primary">
        📩 Accept Request
      </Link>
    );
  }

  return (
    <button
      className="btn btn--primary"
      onClick={handleAdd}
      disabled={loading}
    >
      {loading ? "Sending..." : "➕ Add Friend"}
    </button>
  );
}
