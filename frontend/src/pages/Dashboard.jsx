import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const TOTAL_TARGET = 150;
const LEVEL_TARGETS = { easy: 50, medium: 70, hard: 30 };

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await client.get('/questions/progress/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner label="Loading your progress…" />;

  const progressPercent = Math.min(100, Math.round((stats.total / TOTAL_TARGET) * 100));
  const starred = user?.starredQuestions?.length || 0;

  const cards = [
    { label: 'Total Solved', value: stats.total, glyph: '🏆', bg: 'linear-gradient(135deg,#5b6cff,#9b59f6)' },
    { label: 'Easy', value: stats.easy, glyph: '🟢', bg: 'linear-gradient(135deg,#22c55e,#16a34a)' },
    { label: 'Medium', value: stats.medium, glyph: '🟠', bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { label: 'Hard', value: stats.hard, glyph: '🔴', bg: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  ];

  return (
    <div className="page">
      <h1 className="section-title">Welcome, {user.name.split(' ')[0]} 👋</h1>
      <p className="section-sub">Here's how your preparation is going.</p>

      <div className="stats-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label} style={{ background: c.bg }}>
            <span className="glyph">{c.glyph}</span>
            <div className="label">{c.label}</div>
            <div className="value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18 }}>Overall Progress</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {stats.total} / {TOTAL_TARGET} ({progressPercent}%)
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 18 }}>Level Breakdown</h2>
        {['easy', 'medium', 'hard'].map((lvl) => {
          const pct = Math.min(100, Math.round((stats[lvl] / LEVEL_TARGETS[lvl]) * 100));
          const color = lvl === 'easy' ? 'var(--easy)' : lvl === 'medium' ? 'var(--medium)' : 'var(--hard)';
          return (
            <div className="level-row" key={lvl}>
              <span className="lname" style={{ textTransform: 'capitalize' }}>{lvl}</span>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="count">{stats[lvl]}/{LEVEL_TARGETS[lvl]}</span>
            </div>
          );
        })}
        <div className="level-row" style={{ marginTop: 8 }}>
          <span className="lname">⭐ Starred</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{starred} question{starred === 1 ? '' : 's'} bookmarked</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
