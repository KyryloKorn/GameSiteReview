'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

const NAV_LINKS = [
  { href: '/games', label: 'Games', icon: '🎮' },
  { href: '/dashboard/tier-lists', label: 'Tier Lists', icon: '🏆' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/friends/activity', label: 'Activity', icon: '👥' },
];

export default function Navbar() {
  const pathname = usePathname();

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
        <nav className="navbar__nav" id="navbar-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar__link ${
                pathname.startsWith(link.href) ? 'navbar__link--active' : ''
              }`}
              id={`nav-link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <span className="navbar__link-icon">{link.icon}</span>
              <span className="navbar__link-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side — Auth buttons */}
        <div className="navbar__actions" id="navbar-actions">
          <Link href="/login" className="btn btn--ghost btn--sm" id="btn-login">
            Log In
          </Link>
          <Link href="/register" className="btn btn--primary btn--sm" id="btn-register">
            Sign Up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="navbar__mobile-toggle btn btn--ghost btn--icon" id="mobile-menu-toggle" aria-label="Toggle menu">
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
