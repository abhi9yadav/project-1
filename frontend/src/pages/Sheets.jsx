import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Reveal from '../components/Reveal';

const SHEETS = [
  {
    name: '1-month',
    title: '1 Month Sprint',
    description: 'A fast-track plan covering the must-know patterns in 30 focused days.',
    color: '#5b6cff',
    tag: 'Beginner friendly',
    duration: '~30 days',
  },
  {
    name: '3-months',
    title: '3 Month Journey',
    description: 'A balanced, comprehensive plan to build real depth across all core topics.',
    color: '#9b59f6',
    tag: 'Most popular',
    duration: '~90 days',
  },
  {
    name: '6-months',
    title: '6 Month Mastery',
    description: 'An exhaustive program to master every pattern and edge case for top interviews.',
    color: '#f59e0b',
    tag: 'Complete',
    duration: '~180 days',
  },
];

const Sheets = () => {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const entries = await Promise.all(
        SHEETS.map(async (s) => {
          try {
            const { data } = await client.get(`/questions/sheet/${s.name}`);
            let questions = 0;
            const topics = Object.keys(data).length;
            for (const subs of Object.values(data)) {
              for (const arr of Object.values(subs)) questions += arr.length;
            }
            return [s.name, { questions, topics }];
          } catch {
            return [s.name, { questions: 0, topics: 0 }];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page">
      <Reveal>
        <p className="lp-eyebrow">Learning paths</p>
        <h1 className="section-title" style={{ textAlign: 'center' }}>Choose your DSA sheet</h1>
        <p className="section-sub" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 40px' }}>
          Pick the plan that matches your timeline. Every sheet tracks your progress,
          notes and starred problems automatically.
        </p>
      </Reveal>

      <div className="lp-sheet-grid">
        {SHEETS.map((s, i) => {
          const c = counts[s.name] || { questions: 0, topics: 0 };
          return (
            <Reveal key={s.name} delay={i * 100}>
              <Link to={`/sheet/${s.name}`} className="lp-sheet-card">
                <div className="lp-sheet-glow" style={{ background: s.color }} />
                <span className="lp-sheet-tag" style={{ color: s.color, borderColor: s.color }}>{s.tag}</span>
                <h3 style={{ color: s.color }}>{s.title}</h3>
                <p>{s.description}</p>

                <div className="sheet-meta">
                  <span className="sheet-meta-item">⏱ {s.duration}</span>
                  <span className="sheet-meta-item">📚 {loading ? '—' : c.topics} topics</span>
                  <span className="sheet-meta-item">✅ {loading ? '—' : c.questions} problems</span>
                </div>

                <span className="lp-sheet-cta" style={{ color: s.color }}>Open sheet →</span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
};

export default Sheets;
