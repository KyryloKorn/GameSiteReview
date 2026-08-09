"use client";

import { useState } from "react";
import Link from "next/link";
import { sendFriendRequest, respondFriendRequest, removeFriend } from "@/app/actions/social";
import "@/components/social/Social.css";

interface FriendUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  currentlyPlaying: string | null;
}

interface PendingRequest {
  id: string;
  requester: FriendUser;
  createdAt: Date;
}

interface FriendsManagerProps {
  friends: FriendUser[];
  pendingRequests: PendingRequest[];
  currentUserId: string;
}

export default function FriendsManager({
  friends,
  pendingRequests,
  currentUserId,
}: FriendsManagerProps) {
  const [activeTab, setActiveTab] = useState<"FRIENDS" | "PENDING" | "FIND">("FRIENDS");

  // Search user state for "FIND" tab
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Success / Info notifications
  const [message, setMessage] = useState<string | null>(null);

  // Search users API endpoint
  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch {
      setMessage("Failed to search users.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string, username: string) => {
    setSearchResults((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, friendshipStatus: "PENDING_SENT" } : u))
    );
    const res = await sendFriendRequest(username);
    setMessage(res.message || (res.success ? "Request sent!" : "Failed to send request."));
  };

  const handleRespond = async (requestId: string, accept: boolean, userId?: string) => {
    if (userId) {
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, friendshipStatus: accept ? "FRIENDS" : "NONE" } : u))
      );
    }
    const res = await respondFriendRequest(requestId, accept);
    setMessage(res.message || "Updated request.");
  };

  const handleRemove = async (userId: string) => {
    if (confirm("Are you sure you want to remove this friend?")) {
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, friendshipStatus: "NONE" } : u))
      );
      const res = await removeFriend(userId);
      setMessage(res.message || "Friend removed.");
    }
  };

  return (
    <div className="friends-manager">
      {/* Notifications */}
      {message && (
        <div className="review-form__alert review-form__alert--success" style={{ marginBottom: "var(--space-6)" }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="game-filters__row" style={{ marginBottom: "var(--space-8)" }}>
        <button
          className={`btn ${activeTab === "FRIENDS" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setActiveTab("FRIENDS")}
        >
          👥 My Friends ({friends.length})
        </button>

        <button
          className={`btn ${activeTab === "PENDING" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setActiveTab("PENDING")}
        >
          📩 Pending Requests {pendingRequests.length > 0 && <span className="badge badge--accent">{pendingRequests.length}</span>}
        </button>

        <button
          className={`btn ${activeTab === "FIND" ? "btn--primary" : "btn--secondary"}`}
          onClick={() => setActiveTab("FIND")}
        >
          🔍 Find Gamers
        </button>
      </div>

      {/* TAB 1: MY FRIENDS */}
      {activeTab === "FRIENDS" && (
        <div>
          {friends.length > 0 ? (
            <div className="user-card-grid">
              {friends.map((friend) => (
                <div key={friend.id} className="user-card glass-card">
                  <div className="user-card__avatar">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt={friend.username} />
                    ) : (
                      friend.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="user-card__info">
                    <Link href={`/user/${friend.username}`} className="user-card__name">
                      {friend.displayName || friend.username}
                    </Link>
                    <span className="user-card__username">@{friend.username}</span>

                    {friend.currentlyPlaying && (
                      <span className="user-card__playing">
                        🎮 Playing {friend.currentlyPlaying}
                      </span>
                    )}
                  </div>

                  <div className="user-card__actions">
                    <button
                      className="btn btn--ghost btn--sm review-card__delete-btn"
                      onClick={() => handleRemove(friend.id)}
                      title="Remove Friend"
                    >
                      Remove Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="review-list__empty glass-card">
              <div className="review-list__empty-icon">👥</div>
              <h3>No friends yet</h3>
              <p>Search for gamers or share your profile to connect with friends!</p>
              <button className="btn btn--primary" onClick={() => setActiveTab("FIND")}>
                Find Gamers
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING REQUESTS */}
      {activeTab === "PENDING" && (
        <div>
          {pendingRequests.length > 0 ? (
            <div className="user-card-grid">
              {pendingRequests.map((req) => (
                <div key={req.id} className="user-card glass-card">
                  <div className="user-card__avatar">
                    {req.requester.avatarUrl ? (
                      <img src={req.requester.avatarUrl} alt={req.requester.username} />
                    ) : (
                      req.requester.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="user-card__info">
                    <Link href={`/user/${req.requester.username}`} className="user-card__name">
                      {req.requester.displayName || req.requester.username}
                    </Link>
                    <span className="user-card__username">@{req.requester.username}</span>
                  </div>

                  <div className="user-card__actions">
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => handleRespond(req.id, true, req.requester.id)}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleRespond(req.id, false, req.requester.id)}
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="review-list__empty glass-card">
              <div className="review-list__empty-icon">📩</div>
              <h3>No pending requests</h3>
              <p>When someone sends you a friend request, it will show up here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FIND GAMERS */}
      {activeTab === "FIND" && (
        <div>
          <form onSubmit={handleSearchUsers} className="search-bar" style={{ maxWidth: "600px", marginBottom: "var(--space-8)" }}>
            <div className="search-bar__input-wrapper">
              <span className="search-bar__icon">🔍</span>
              <input
                type="text"
                className="input search-bar__input"
                placeholder="Search gamers by username or display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn--primary btn--sm" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {searchResults.length > 0 ? (
            <div className="user-card-grid">
              {searchResults.map((user) => (
                <div key={user.id} className="user-card glass-card">
                  <div className="user-card__avatar">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="user-card__info">
                    <Link href={`/user/${user.username}`} className="user-card__name">
                      {user.displayName || user.username}
                    </Link>
                    <span className="user-card__username">@{user.username}</span>
                  </div>

                  <div className="user-card__actions">
                    {user.id !== currentUserId && (
                      <>
                        {user.friendshipStatus === "FRIENDS" && (
                          <button
                            className="btn btn--ghost btn--sm review-card__delete-btn"
                            onClick={() => handleRemove(user.id)}
                            title="Remove Friend"
                          >
                            Remove Friend
                          </button>
                        )}

                        {user.friendshipStatus === "PENDING_SENT" && (
                          <button className="btn btn--secondary btn--sm" disabled>
                            📩 Pending
                          </button>
                        )}

                        {user.friendshipStatus === "PENDING_RECEIVED" && (
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => setActiveTab("PENDING")}
                          >
                            📩 Respond
                          </button>
                        )}

                        {user.friendshipStatus === "NONE" && (
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => handleSendRequest(user.id, user.username)}
                          >
                            ➕ Add Friend
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            searchQuery.trim() &&
            !isSearching && (
              <div className="review-list__empty glass-card">
                <div className="review-list__empty-icon">🔍</div>
                <h3>No gamers found</h3>
                <p>Try searching for a different username or display name.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
