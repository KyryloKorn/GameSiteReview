"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="auth-form" id="signup-form">
      {/* Global error message */}
      {state?.message && (
        <div className="auth-form__alert auth-form__alert--error" id="signup-error">
          <span className="auth-form__alert-icon">⚠️</span>
          {state.message}
        </div>
      )}

      {/* Username */}
      <div className="auth-form__field">
        <label htmlFor="username" className="auth-form__label">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="coolplayer42"
          className="input"
          autoComplete="username"
          required
        />
        {state?.errors?.username && (
          <p className="auth-form__error">{state.errors.username[0]}</p>
        )}
      </div>

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
          autoComplete="new-password"
          required
        />
        {state?.errors?.password && (
          <div className="auth-form__error-list">
            {state.errors.password.map((error) => (
              <p key={error} className="auth-form__error">
                {error}
              </p>
            ))}
          </div>
        )}
        <p className="auth-form__hint">
          Min 8 chars, at least one letter and one number
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn--primary btn--lg auth-form__submit"
        disabled={pending}
        id="btn-signup-submit"
      >
        {pending ? (
          <span className="auth-form__spinner" />
        ) : null}
        {pending ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
