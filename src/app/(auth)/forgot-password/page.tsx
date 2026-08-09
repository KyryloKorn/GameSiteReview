import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import "../auth.css";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your GameRank account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page" id="forgot-password-page">
      <div className="auth-page__bg-orbs">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <div className="auth-card glass-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">🔑</div>
          <h1 className="auth-card__title">Reset Password</h1>
          <p className="auth-card__subtitle">
            Enter your account email and new password below
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
