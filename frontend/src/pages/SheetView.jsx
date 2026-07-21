import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const LEVELS = ['all', 'easy', 'medium', 'hard'];

const SheetView = () => {
  const { sheetName } = useParams();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const [collapsedSub, setCollapsedSub] = useState({});
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data } = await client.get(`/questions/sheet/${sheetName}`);
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Could not load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [sheetName]);

  const solvedIds = useMemo(
    () => new Set((user?.solvedQuestions || []).map((q) => String(q.questionId))),
    [user]
  );
  const starredIds = useMemo(
    () => new Set((user?.starredQuestions || []).map((q) => String(q.questionId))),
    [user]
  );

  const isSolved = (id) => solvedIds.has(String(id));
  const isStarred = (id) => starredIds.has(String(id));

  // Filter by search + level while preserving topic/subtopic structure.
  const filtered = useMemo(() => {
    const result = {};
    for (const [topic, subs] of Object.entries(questions)) {
      const keptSubs = {};
      for (const [sub, qs] of Object.entries(subs)) {
        const kept = qs.filter((q) => {
          const matchesLevel = level === 'all' || q.level === level;
          const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
          return matchesLevel && matchesSearch;
        });
        if (kept.length) keptSubs[sub] = kept;
      }
      if (Object.keys(keptSubs).length) result[topic] = keptSubs;
    }
    return result;
  }, [questions, search, level]);

  // Solved/total stats for a flat list of questions (used by both topic & subtopic).
  const statsFor = (qs) => {
    const total = qs.length;
    const solved = qs.filter((q) => isSolved(q._id)).length;
    return { total, solved, pct: total ? Math.round((solved / total) * 100) : 0 };
  };
  const topicStats = (subs) => statsFor(Object.values(subs).flat());

  const requireLogin = () => {
    if (!user) {
      toast.error('Please log in to track progress');
      return false;
    }
    return true;
  };

  const toggleSolved = async (id) => {
    if (!requireLogin()) return;
    setBusy(id + ':solve');
    try {
      await client.post(`/questions/${id}/solve`);
      await refreshUser();
      toast.success(isSolved(id) ? 'Marked as unsolved' : 'Marked as solved');
    } catch {
      toast.error('Update failed');
    } finally {
      setBusy(null);
    }
  };

  const toggleStar = async (id) => {
    if (!requireLogin()) return;
    setBusy(id + ':star');
    try {
      await client.post(`/questions/${id}/star`);
      await refreshUser();
    } catch {
      toast.error('Update failed');
    } finally {
      setBusy(null);
    }
  };

  const openQuestion = (q) => {
    const existing = (user?.notes || []).find((n) => String(n.questionId) === String(q._id));
    setNote(existing?.note || '');
    setShowSimilar(false);
    setSelected(q);
  };

  const saveNote = async () => {
    if (!requireLogin()) return;
    try {
      await client.post(`/questions/${selected._id}/note`, { note });
      await refreshUser();
      toast.success('Note saved');
    } catch {
      toast.error('Could not save note');
    }
  };

  const toggleCollapse = (topic) =>
    setCollapsed((c) => ({ ...c, [topic]: !c[topic] }));
  const toggleSub = (key) =>
    setCollapsedSub((c) => ({ ...c, [key]: !c[key] }));

  if (loading) return <Spinner label="Loading questions…" />;

  const title = sheetName.replace('-', ' ');
  const hasAny = Object.keys(questions).length > 0;
  const hasResults = Object.keys(filtered).length > 0;

  return (
    <div className="page">
      <h1 className="section-title" style={{ textTransform: 'capitalize' }}>{title} Sheet</h1>
      <p className="section-sub">Work through the problems and track your progress.</p>

      {hasAny && (
        <div className="toolbar">
          <div className="search">
            <span className="search-icon">🔍</span>
            <input
              className="input"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            {LEVELS.map((l) => (
              <button
                key={l}
                className={`chip ${level === l ? 'active' : ''}`}
                onClick={() => setLevel(l)}
                style={{ textTransform: 'capitalize' }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasAny && (
        <div className="empty">
          <div className="big">📭</div>
          <h3>No questions yet</h3>
          <p>An admin needs to add questions to this sheet.{user?.isAdmin && ' '}
            {user?.isAdmin && <Link to="/admin">Add one now →</Link>}
          </p>
        </div>
      )}

      {hasAny && !hasResults && (
        <div className="empty">
          <div className="big">🔎</div>
          <h3>No matches</h3>
          <p>Try a different search or filter.</p>
        </div>
      )}

      {Object.entries(filtered).map(([topic, subs]) => {
        const st = topicStats(subs);
        const topicOpen = search ? true : !collapsed[topic];
        const topicDone = st.total > 0 && st.solved === st.total;
        return (
          <div className="topic-block" key={topic}>
            <div className={`topic-head ${topicOpen ? 'open' : ''}`} onClick={() => toggleCollapse(topic)}>
              <h2>
                <span className={`chevron ${topicOpen ? 'open' : ''}`}>▸</span>
                {topic}
                {topicDone && <span className="done-pill">✓ Done</span>}
              </h2>
              <div className="topic-meta">
                <span className="topic-progress-text">{st.solved}/{st.total}</span>
                <div className="mini-track">
                  <div className="mini-fill" style={{ width: `${st.pct}%` }} />
                </div>
              </div>
            </div>

            {topicOpen && (
              <div className="topic-body">
                {Object.entries(subs).map(([sub, qs]) => {
                  const sst = statsFor(qs);
                  const subKey = `${topic}|||${sub}`;
                  const subOpen = search ? true : !collapsedSub[subKey];
                  const subDone = sst.total > 0 && sst.solved === sst.total;
                  return (
                    <div className="subtopic-block" key={sub}>
                      <div className={`subtopic-head ${subOpen ? 'open' : ''}`} onClick={() => toggleSub(subKey)}>
                        <span className="subtopic-name">
                          <span className={`chevron sm ${subOpen ? 'open' : ''}`}>▸</span>
                          {sub}
                          {subDone && <span className="done-dot" title="All solved">✓</span>}
                        </span>
                        <span className="subtopic-meta">
                          <span className="topic-progress-text">{sst.solved}/{sst.total}</span>
                          <div className="mini-track sm">
                            <div className="mini-fill" style={{ width: `${sst.pct}%` }} />
                          </div>
                        </span>
                      </div>

                      {subOpen && (
                        <div className="subtopic-body">
                          <div className="timeline">
                            {qs.map((q, idx) => {
                              const solved = isSolved(q._id);
                              const nextSolved = idx < qs.length - 1 && isSolved(qs[idx + 1]._id);
                              return (
                                <div
                                  className={`tl-item ${solved ? 'solved' : ''} ${nextSolved ? 'link-next' : ''}`}
                                  key={q._id}
                                >
                                  <div className="tl-rail">
                                    <button
                                      className={`tl-bulb ${solved ? 'on' : ''}`}
                                      onClick={() => toggleSolved(q._id)}
                                      disabled={busy === q._id + ':solve'}
                                      title={solved ? 'Solved — click to undo' : 'Mark as solved'}
                                    >
                                      <span className="tl-bulb-core" />
                                    </button>
                                  </div>

                                  <div className={`tl-card ${solved ? 'solved' : ''}`}>
                                    <span className="q-title">{q.title}</span>
                                    <span className={`badge badge-${q.level}`}>{q.level}</span>
                                    <a
                                      className="q-link"
                                      href={q.questionLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Open problem"
                                    >
                                      🔗
                                    </a>
                                    {q.videoLink && (
                                      <a
                                        className="q-link"
                                        href={q.videoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Watch video solution"
                                      >
                                        🎥
                                      </a>
                                    )}
                                    <button
                                      className={`star-btn ${isStarred(q._id) ? 'on' : ''}`}
                                      onClick={() => toggleStar(q._id)}
                                      disabled={busy === q._id + ':star'}
                                      title="Star"
                                    >
                                      {isStarred(q._id) ? '★' : '☆'}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => openQuestion(q)}>
                                      View
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <h2>{selected.title}</h2>
            <p className="meta">
              {selected.topic} · {selected.subtopic}
              {'  '}<span className={`badge badge-${selected.level}`}>{selected.level}</span>
            </p>

            <div className="link-row">
              <a className="link-pill" href={selected.questionLink} target="_blank" rel="noopener noreferrer">
                🔗 Problem
              </a>
              {selected.videoLink && (
                <a className="link-pill" href={selected.videoLink} target="_blank" rel="noopener noreferrer">
                  🎥 Video
                </a>
              )}
            </div>

            {selected.similarQuestions?.length > 0 && (
              <>
                <hr className="divider" />
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSimilar((s) => !s)}>
                  {showSimilar ? 'Hide' : 'Show'} similar questions ({selected.similarQuestions.length})
                </button>
                {showSimilar && (
                  <ul className="similar-list" style={{ marginTop: 12 }}>
                    {selected.similarQuestions.map((sq) => (
                      <li key={sq._id}>
                        <span>{sq.title}</span>
                        <span className={`badge badge-${sq.level}`}>{sq.level}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <hr className="divider" />
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>Your Notes</h3>
            <textarea
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your approach, edge cases, or reminders…"
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={saveNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetView;
