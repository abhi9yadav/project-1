import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';

const sheets = [
  { name: '1-month', title: '1 Month Sprint', description: 'A fast-track plan covering the essentials in 30 focused days.', color: '#5b6cff', tag: 'Beginner friendly' },
  { name: '3-months', title: '3 Month Journey', description: 'A balanced, comprehensive plan to build real depth.', color: '#9b59f6', tag: 'Most popular' },
  { name: '6-months', title: '6 Month Mastery', description: 'A deep, exhaustive program to master every pattern.', color: '#f59e0b', tag: 'Complete' },
];

const features = [
  { icon: '✅', title: 'Progress Tracking', text: 'Check off problems and watch your stats climb in real time.' },
  { icon: '⭐', title: 'Smart Bookmarks', text: 'Star tricky problems and revisit them before interviews.' },
  { icon: '📝', title: 'Personal Notes', text: 'Save your approach, edge cases and gotchas per question.' },
  { icon: '🎥', title: 'Video Solutions', text: 'Jump straight to curated walkthroughs for tough problems.' },
  { icon: '📊', title: 'Visual Dashboard', text: 'See your difficulty breakdown and completion at a glance.' },
  { icon: '🌙', title: 'Light & Dark', text: 'A polished interface that adapts to your preference.' },
];

const steps = [
  { n: '01', title: 'Pick a sheet', text: 'Choose the plan that fits your timeline — 1, 3, or 6 months.' },
  { n: '02', title: 'Solve & track', text: 'Work through curated problems and mark them as you go.' },
  { n: '03', title: 'Review & master', text: 'Revisit starred questions and notes to lock in the patterns.' },
];

const topics = ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Trees', 'Graphs', 'DP', 'Greedy', 'Backtracking', 'Heaps', 'Tries', 'Binary Search', 'Sliding Window', 'Recursion'];

const Home = () => (
  <div className="landing">
    {/* ---------- HERO ---------- */}
    <section className="lp-hero">
      <div className="lp-aurora" />
      <div className="lp-grid-overlay" />
      <span className="lp-orb lp-orb-1" />
      <span className="lp-orb lp-orb-2" />
      <span className="lp-orb lp-orb-3" />

      <div className="lp-hero-inner">
        <div className="lp-badge">
          <span className="lp-badge-dot" /> Track · Practice · Master
        </div>

        <h1 className="lp-title">
          <span className="lp-line">Crack the code of</span>
          <span className="lp-line lp-gradient-anim">Data Structures &amp; Algorithms</span>
        </h1>

        <p className="lp-sub">
          Your all-in-one companion to conquer DSA — structured sheets, live progress
          tracking, notes, and curated video solutions. Built for serious interview prep.
        </p>

        <div className="lp-cta">
          <Link to="/register" className="btn btn-primary lp-btn-glow">Get Started Free</Link>
          <Link to="/sheets" className="btn btn-ghost lp-btn-lg">Explore Sheets →</Link>
        </div>

        <div className="lp-stats">
          <div className="lp-stat">
            <div className="lp-stat-num"><CountUp end={500} suffix="+" /></div>
            <div className="lp-stat-label">Curated Problems</div>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat">
            <div className="lp-stat-num"><CountUp end={3} /></div>
            <div className="lp-stat-label">Learning Paths</div>
          </div>
          <div className="lp-stat-divider" />
          <div className="lp-stat">
            <div className="lp-stat-num"><CountUp end={100} suffix="%" /></div>
            <div className="lp-stat-label">Free &amp; Open</div>
          </div>
        </div>
      </div>

      {/* floating decorative cards */}
      <div className="lp-float-card lp-float-1">
        <div className="lp-fc-check">✓</div>
        <div>
          <div className="lp-fc-title">Two Sum</div>
          <span className="badge badge-easy">easy</span>
        </div>
      </div>
      <div className="lp-float-card lp-float-2">
        <div className="lp-fc-ring">
          <svg viewBox="0 0 36 36" className="lp-ring-svg">
            <path className="lp-ring-bg" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" />
            <path className="lp-ring-fg" d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31" />
          </svg>
          <span className="lp-ring-text">72%</span>
        </div>
        <div className="lp-fc-title">Weekly goal</div>
      </div>
      <div className="lp-float-card lp-float-3">
        <span className="badge badge-hard">hard</span>
        <div className="lp-fc-title">Median of Arrays</div>
        <div className="lp-fc-sub">🎥 Video available</div>
      </div>
    </section>

    {/* ---------- MARQUEE ---------- */}
    <div className="lp-marquee">
      <div className="lp-marquee-track">
        {[...topics, ...topics].map((t, i) => (
          <span className="lp-topic-chip" key={i}>{t}</span>
        ))}
      </div>
    </div>

    {/* ---------- FEATURES ---------- */}
    <section className="lp-section">
      <Reveal>
        <p className="lp-eyebrow">Everything you need</p>
        <h2 className="lp-heading">A complete toolkit for focused prep</h2>
      </Reveal>
      <div className="lp-feature-grid">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <div className="lp-feature">
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    {/* ---------- SHEETS ---------- */}
    <section className="lp-section">
      <Reveal>
        <p className="lp-eyebrow">Choose your path</p>
        <h2 className="lp-heading">Pick the plan that fits your timeline</h2>
      </Reveal>
      <div className="lp-sheet-grid">
        {sheets.map((s, i) => (
          <Reveal key={s.name} delay={i * 100}>
            <Link to={`/sheet/${s.name}`} className="lp-sheet-card">
              <div className="lp-sheet-glow" style={{ background: s.color }} />
              <span className="lp-sheet-tag" style={{ color: s.color, borderColor: s.color }}>{s.tag}</span>
              <h3 style={{ color: s.color }}>{s.title}</h3>
              <p>{s.description}</p>
              <span className="lp-sheet-cta" style={{ color: s.color }}>Start now →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>

    {/* ---------- HOW IT WORKS ---------- */}
    <section className="lp-section">
      <Reveal>
        <p className="lp-eyebrow">How it works</p>
        <h2 className="lp-heading">Three steps to consistent progress</h2>
      </Reveal>
      <div className="lp-steps">
        <div className="lp-steps-line" />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className="lp-step">
              <div className="lp-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    {/* ---------- CTA BAND ---------- */}
    <section className="lp-cta-band">
      <div className="lp-cta-inner">
        <Reveal>
          <h2>Ready to start your DSA journey?</h2>
          <p>Join now and turn scattered practice into steady, trackable progress.</p>
          <Link to="/register" className="btn lp-cta-btn">Create your free account</Link>
        </Reveal>
      </div>
    </section>

    {/* ---------- FOOTER ---------- */}
    <footer className="lp-footer">
      <div className="brand"><span className="brand-mark">◈</span> DSA Tracker</div>
      <p>Built for developers who want to master algorithms, one problem at a time.</p>
    </footer>
  </div>
);

export default Home;
