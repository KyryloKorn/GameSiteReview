'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import './Navbar.css';

const NAV_LINKS = [
  { href: '/games', label: 'Games', icon: '🎮' },
  { href: '/dashboard/tier-lists', label: 'Tier Lists', icon: '🏆' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/friends/activity', label: 'Activity', icon: '⚡' },
  { href: '/friends', label: 'Friends', icon: '👥' },
];

interface NavbarProps {
  user?: {
    username: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="navbar" id="main-navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link href="/" className="navbar__logo" id="navbar-logo">
          <span className="navbar__logo-icon">🎯</span>
          <span className="navbar__logo-text">
            Game<span className="navbar__logo-accent">Rank</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav
          className={`navbar__nav ${mobileOpen ? 'navbar__nav--open' : ''}`}
          id="navbar-nav"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__link ${
                pathname.startsWith(link.href) ? 'navbar__link--active' : ''
              }`}
              id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="navbar__link-icon">{link.icon}</span>
              <span className="navbar__link-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side — Auth-aware actions */}
        <div className="navbar__actions" id="navbar-actions">
          {user ? (
            <>
              <Link href={`/user/${user.username}`} className="navbar__user" id="navbar-user-link">
                <span className="navbar__avatar">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="navbar__username">{user.username}</span>
              </Link>
              <form action={logout}>
                <button type="submit" className="btn btn--ghost btn--sm" id="btn-logout">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost btn--sm" id="btn-login">
                Log In
              </Link>
              <Link href="/register" className="btn btn--primary btn--sm" id="btn-register">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="navbar__mobile-toggle btn btn--ghost btn--icon"
          id="mobile-menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
