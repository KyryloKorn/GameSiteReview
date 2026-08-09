"use client";

import { useActionState, useState } from "react";
import { updateAccountSettings } from "@/app/actions/auth";

interface SettingsFormProps {
  user: {
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    currentlyPlaying: string | null;
  };
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
];

export default function SettingsForm({ user }: SettingsFormProps) {
  const [state, action, isPending] = useActionState(updateAccountSettings, undefined);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl || "");

  return (
    <form action={action} className="review-form glass-card" style={{ maxWidth: "680px", margin: "0 auto" }}>
      {state?.message && (
        <div
          className={`review-form__alert ${
            state.success ? "review-form__alert--success" : "review-form__alert--error"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Section 1: Avatar */}
      <div className="review-form__section">
        <h3 className="review-form__section-title">Avatar Image</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div className="user-card__avatar" style={{ width: "64px", height: "64px", fontSize: "1.5rem" }}>
            {selectedAvatar ? (
              <img src={selectedAvatar} alt="Avatar preview" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Choose a preset avatar or enter an image URL below:
            </span>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(preset)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: selectedAvatar === preset ? "2px solid var(--color-primary-light)" : "1px solid var(--color-border)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <img src={preset} alt={`Preset ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="review-form__field">
          <label className="review-form__label">Custom Avatar URL</label>
          <input
            type="url"
            name="avatarUrl"
            className="input"
            placeholder="https://example.com/avatar.jpg"
            value={selectedAvatar}
            onChange={(e) => setSelectedAvatar(e.target.value)}
          />
          {state?.errors?.avatarUrl && (
            <span className="review-form__error">{state.errors.avatarUrl[0]}</span>
          )}
        </div>
      </div>

      {/* Section 2: Profile Info */}
      <div className="review-form__section">
        <h3 className="review-form__section-title">Public Profile</h3>

        <div className="review-form__field">
          <label className="review-form__label">Display Name</label>
          <input
            type="text"
            name="displayName"
            className="input"
            defaultValue={user.displayName || user.username}
            placeholder="Gamer tag or display name"
          />
          {state?.errors?.displayName && (
            <span className="review-form__error">{state.errors.displayName[0]}</span>
          )}
        </div>

        <div className="review-form__field">
          <label className="review-form__label">Bio</label>
          <textarea
            name="bio"
            className="input textarea"
            rows={3}
            defaultValue={user.bio || ""}
            placeholder="Tell fellow gamers about your favorite genres and gaming setup..."
          />
          {state?.errors?.bio && (
            <span className="review-form__error">{state.errors.bio[0]}</span>
          )}
        </div>

        <div className="review-form__field">
          <label className="review-form__label">Currently Playing</label>
          <input
            type="text"
            name="currentlyPlaying"
            className="input"
            defaultValue={user.currentlyPlaying || ""}
            placeholder="e.g. Elden Ring, Baldur's Gate 3..."
          />
        </div>
      </div>

      {/* Section 3: Account Credentials */}
      <div className="review-form__section">
        <h3 className="review-form__section-title">Account Credentials</h3>

        <div className="review-form__field">
          <label className="review-form__label">Email Address</label>
          <input
            type="email"
            name="email"
            className="input"
            defaultValue={user.email}
            required
          />
          {state?.errors?.email && (
            <span className="review-form__error">{state.errors.email[0]}</span>
          )}
        </div>

        <div className="review-form__field">
          <label className="review-form__label">Current Password (required to change password)</label>
          <input
            type="password"
            name="currentPassword"
            className="input"
            placeholder="••••••••"
          />
        </div>

        <div className="review-form__field">
          <label className="review-form__label">New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="newPassword"
            className="input"
            placeholder="••••••••"
          />
          {state?.errors?.newPassword && (
            <span className="review-form__error">{state.errors.newPassword[0]}</span>
          )}
        </div>
      </div>

      <div className="review-form__actions">
        <button type="submit" className="btn btn--primary btn--lg" disabled={isPending}>
          {isPending ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
