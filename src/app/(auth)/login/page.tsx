import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import Link from "next/link";
import "../auth.css";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your GameRank account.",
};

export default function LoginPage() {
  return (
    <div className="auth-page" id="login-page">
      <div className="auth-page__bg-orbs">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-card glass-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">🎯</div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">
            Log in to continue your gaming journey
          </p>
        </div>

        <LoginForm />

        <div className="auth-card__footer">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="auth-card__link" id="link-to-register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
