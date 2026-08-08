import Link from 'next/link';
import './page.css';

const FEATURES = [
  {
    icon: '🏆',
    title: 'Build Tier Lists',
    description:
      'Drag and drop your games into custom tiers. Create S-tier to F-tier rankings for any genre, year, or theme.',
  },
  {
    icon: '📝',
    title: 'Write Reviews',
    description:
      'Share your thoughts with detailed reviews. Rate gameplay, story, graphics, sound, and replayability.',
  },
  {
    icon: '📚',
    title: 'Track Your Library',
    description:
      'Mark games as playing, completed, or backlog. See your stats, genre breakdown, and gaming journey.',
  },
  {
    icon: '👥',
    title: 'Connect with Friends',
    description:
      'Find your gaming friends, see their activity, compare tier lists, and discover what they\'re playing.',
  },
  {
    icon: '🎮',
    title: '200K+ Games',
    description:
      'Browse a massive catalog powered by IGDB. Every major game from every platform, all in one place.',
  },
  {
    icon: '🔒',
    title: 'Private or Public',
    description:
      'Keep reviews private as a personal journal, share with friends only, or publish for everyone to see.',
  },
];

const TIER_PREVIEW = [
  { label: 'S', color: 'var(--tier-s)', games: ['The Witcher 3', 'Red Dead 2', 'Elden Ring'] },
  { label: 'A', color: 'var(--tier-a)', games: ['God of War', 'Hades', 'Celeste'] },
  { label: 'B', color: 'var(--tier-b)', games: ['Cyberpunk 2077', 'Starfield'] },
  { label: 'C', color: 'var(--tier-c)', games: ['Far Cry 6'] },
];

export default function HomePage() {
  return (
    <div className="landing" id="landing-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero__bg-orbs">
          <div className="hero__orb hero__orb--primary" />
          <div className="hero__orb hero__orb--accent" />
          <div className="hero__orb hero__orb--subtle" />
        </div>

        <div className="hero__content container">
          <div className="hero__text">
            <div className="hero__badge badge badge--primary">
              🚀 Your gaming journey starts here
            </div>
            <h1 className="hero__title">
              Rate, Rank &<br />
              <span className="hero__title-gradient">Review</span> Your Games
            </h1>
            <p className="hero__subtitle">
              Build personal tier lists, write detailed reviews, track your gaming library,
              and share your journey with friends. All in one beautiful platform.
            </p>
            <div className="hero__actions">
              <Link href="/register" className="btn btn--primary btn--lg" id="hero-cta-register">
                Get Started — It&apos;s Free
              </Link>
              <Link href="/games" className="btn btn--secondary btn--lg" id="hero-cta-browse">
                Browse Games
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">200K+</span>
                <span className="hero__stat-label">Games</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">All</span>
                <span className="hero__stat-label">Platforms</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">Free</span>
                <span className="hero__stat-label">Forever</span>
              </div>
            </div>
          </div>

          {/* Tier List Preview */}
          <div className="hero__preview">
            <div className="hero__tier-card glass-card">
              <div className="hero__tier-header">
                <span className="hero__tier-title">🏆 My 2024 Ranking</span>
                <span className="badge badge--accent">Public</span>
              </div>
              <div className="hero__tier-body">
                {TIER_PREVIEW.map((tier) => (
                  <div key={tier.label} className="hero__tier-row">
                    <div
                      className="hero__tier-label"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.label}
                    </div>
                    <div className="hero__tier-games">
                      {tier.games.map((game) => (
                        <div key={game} className="hero__tier-game">
                          {game}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features-section">
        <div className="container">
          <div className="features__header">
            <h2 className="features__title">
              Everything You Need to<br />
              <span className="features__title-gradient">Track Your Gaming</span>
            </h2>
            <p className="features__subtitle">
              From tier lists to reviews, from library tracking to social features —
              GameRank has everything a passionate gamer needs.
            </p>
          </div>

          <div className="features__grid">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="feature-card glass-card"
                id={`feature-${i}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works-section">
        <div className="container">
          <div className="features__header">
            <h2 className="features__title">
              Get Started in<br />
              <span className="features__title-gradient">Three Steps</span>
            </h2>
          </div>

          <div className="steps">
            <div className="step glass-card">
              <div className="step__number">1</div>
              <h3 className="step__title">Create Your Account</h3>
              <p className="step__desc">
                Sign up in seconds with just your email. Set up your profile and tell the world what you&apos;re playing.
              </p>
            </div>
            <div className="step__connector">
              <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                <path d="M0 12H44M44 12L34 4M44 12L34 20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="step glass-card">
              <div className="step__number">2</div>
              <h3 className="step__title">Find & Rate Games</h3>
              <p className="step__desc">
                Browse 200K+ games, add them to your library, and start building your personal tier lists.
              </p>
            </div>
            <div className="step__connector">
              <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                <path d="M0 12H44M44 12L34 4M44 12L34 20" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="step glass-card">
              <div className="step__number">3</div>
              <h3 className="step__title">Share & Connect</h3>
              <p className="step__desc">
                Write reviews, share your tier lists with friends, and discover what your community is playing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="cta-section">
        <div className="container">
          <div className="cta__card glass-card">
            <div className="cta__glow" />
            <h2 className="cta__title">
              Ready to Rank Your Games?
            </h2>
            <p className="cta__subtitle">
              Join thousands of gamers who track, rank, and review their games on GameRank.
            </p>
            <Link href="/register" className="btn btn--primary btn--lg" id="cta-register">
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
