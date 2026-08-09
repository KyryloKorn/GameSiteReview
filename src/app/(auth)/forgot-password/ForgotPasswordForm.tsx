"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={action} className="auth-form" id="forgot-password-form">
      {state?.message && (
        <div
          className={`auth-form__alert ${
            state.success ? "auth-form__alert--success" : "auth-form__alert--error"
          }`}
          style={{
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
            fontSize: "var(--text-sm)",
            background: state.success ? "hsla(142, 70%, 50%, 0.15)" : "hsla(0, 80%, 60%, 0.15)",
            color: state.success ? "var(--color-success)" : "var(--color-error)",
            border: `1px solid ${state.success ? "hsla(142, 70%, 50%, 0.3)" : "hsla(0, 80%, 60%, 0.3)"}`,
          }}
        >
          {state.message}
        </div>
      )}

      <div className="auth-form__field">
        <label htmlFor="email" className="auth-form__label">
          Account Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="input"
          required
        />
        {state?.errors?.email && (
          <p className="auth-form__error">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="auth-form__field">
        <label htmlFor="newPassword" className="auth-form__label">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          className="input"
          required
        />
        {state?.errors?.newPassword && (
          <p className="auth-form__error">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--lg auth-form__submit"
        disabled={pending}
      >
        {pending ? "Resetting Password..." : "Reset Password"}
      </button>

      <div style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
        <Link href="/login" className="auth-card__link" style={{ fontSize: "var(--text-sm)" }}>
          ← Back to Log In
        </Link>
      </div>
    </form>
  );
}
