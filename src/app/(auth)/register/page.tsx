import type { Metadata } from "next";
import SignupForm from "./SignupForm";
import Link from "next/link";
import "../auth.css";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for GameRank — your gaming tier list and review platform.",
};

export default function RegisterPage() {
  return (
    <div className="auth-page" id="register-page">
      <div className="auth-page__bg-orbs">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-card glass-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">🎯</div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">
            Start building tier lists and reviewing games
          </p>
        </div>

        <SignupForm />

        <div className="auth-card__footer">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="auth-card__link" id="link-to-login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
