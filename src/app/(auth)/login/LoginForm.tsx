"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="auth-form" id="login-form">
      {/* Global error message */}
      {state?.message && (
        <div className="auth-form__alert auth-form__alert--error" id="login-error">
          <span className="auth-form__alert-icon">⚠️</span>
          {state.message}
        </div>
      )}

      {/* Email */}
      <div className="auth-form__field">
        <label htmlFor="email" className="auth-form__label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
          required
        />
        {state?.errors?.email && (
          <p className="auth-form__error">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div className="auth-form__field">
        <label htmlFor="password" className="auth-form__label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="input"
          autoComplete="current-password"
          required
        />
        {state?.errors?.password && (
          <p className="auth-form__error">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary btn--lg auth-form__submit"
        disabled={pending}
        id="btn-login-submit"
      >
        {pending ? (
          <span className="auth-form__spinner" />
        ) : null}
        {pending ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
