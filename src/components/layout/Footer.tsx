import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__inner container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">🎯</span>
              <span className="footer__logo-text">
                Game<span className="footer__logo-accent">Rank</span>
              </span>
            </div>
            <p className="footer__tagline">
              Your gaming journey, ranked and reviewed.
            </p>
          </div>

          {/* Links */}
          <div className="footer__section">
            <h4 className="footer__section-title">Platform</h4>
            <nav className="footer__links">
              <Link href="/games" className="footer__link">Browse Games</Link>
              <Link href="/dashboard/tier-lists" className="footer__link">Tier Lists</Link>
              <Link href="/dashboard/reviews" className="footer__link">Reviews</Link>
              <Link href="/dashboard" className="footer__link">Dashboard</Link>
            </nav>
          </div>

          <div className="footer__section">
            <h4 className="footer__section-title">Community</h4>
            <nav className="footer__links">
              <Link href="/friends/find" className="footer__link">Find Friends</Link>
              <Link href="/friends/activity" className="footer__link">Activity Feed</Link>
            </nav>
          </div>

          <div className="footer__section">
            <h4 className="footer__section-title">Account</h4>
            <nav className="footer__links">
              <Link href="/login" className="footer__link">Log In</Link>
              <Link href="/register" className="footer__link">Sign Up</Link>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} GameRank. Built for gamers, by gamers.
          </p>
          <p className="footer__powered">
            Powered by <span className="footer__powered-highlight">IGDB</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
