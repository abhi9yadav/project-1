import { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';

const EMPTY = {
  title: '', sheet: '1-month', topic: '', subtopic: '',
  level: 'easy', questionLink: '', videoLink: '',
  resources: [], similarQuestions: [],
};

const AdminPanel = () => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const formRef = useRef(null);

  const isEditing = Boolean(editingId);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const loadList = useCallback(async (sheet) => {
    setListLoading(true);
    try {
      const { data } = await client.get(`/questions/sheet/${sheet}`);
      // Flatten grouped { topic: { subtopic: [q] } } into a flat array.
      const flat = [];
      for (const subs of Object.values(data)) {
        for (const qs of Object.values(subs)) flat.push(...qs);
      }
      setList(flat);
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { loadList(form.sheet); }, [form.sheet, loadList]);

  const resetForm = () => {
    setForm({ ...EMPTY, sheet: form.sheet });
    setEditingId(null);
  };

  const startEdit = (q) => {
    setForm({
      title: q.title || '',
      sheet: q.sheet || '1-month',
      topic: q.topic || '',
      subtopic: q.subtopic || '',
      level: q.level || 'easy',
      questionLink: q.questionLink || '',
      videoLink: q.videoLink || '',
      resources: q.resources || [],
      similarQuestions: (q.similarQuestions || []).map((s) => (typeof s === 'object' ? s._id : s)),
    });
    setEditingId(q._id);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await client.put(`/questions/${editingId}`, form);
        toast.success('Question updated');
      } else {
        await client.post('/questions', form);
        toast.success('Question added');
      }
      const sheet = form.sheet;
      resetForm();
      loadList(sheet);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return;
    try {
      await client.delete(`/questions/${id}`);
      toast.success('Question deleted');
      setList((l) => l.filter((q) => q._id !== id));
      if (editingId === id) resetForm();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="page">
      <h1 className="section-title">Admin Panel</h1>
      <p className="section-sub">Add, edit, and manage questions across sheets.</p>

      <div className="card" style={{ marginBottom: 24 }} ref={formRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 18 }}>
            {isEditing ? '✏️ Edit Question' : '➕ Add Question'}
          </h2>
          {isEditing && (
            <span className="badge badge-medium">Editing</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Question Title</label>
            <input className="input" name="title" value={form.title} onChange={change} required />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Sheet</label>
              <select className="input" name="sheet" value={form.sheet} onChange={change}>
                <option value="1-month">1 Month</option>
                <option value="3-months">3 Months</option>
                <option value="6-months">6 Months</option>
              </select>
            </div>
            <div className="field">
              <label>Level</label>
              <select className="input" name="level" value={form.level} onChange={change}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Topic</label>
              <input className="input" name="topic" value={form.topic} onChange={change} required />
            </div>
            <div className="field">
              <label>Subtopic</label>
              <input className="input" name="subtopic" value={form.subtopic} onChange={change} required />
            </div>
          </div>

          <div className="field">
            <label>Question Link</label>
            <input className="input" type="url" name="questionLink" value={form.questionLink} onChange={change} required />
          </div>
          <div className="field">
            <label>Video Link (optional)</label>
            <input className="input" type="url" name="videoLink" value={form.videoLink} onChange={change} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEditing ? 'Update Question' : 'Add Question'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18 }}>Questions in “{form.sheet}”</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{list.length} total</span>
        </div>

        {listLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : list.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No questions in this sheet yet.</p>
        ) : (
          list.map((q) => (
            <div className={`q-row ${editingId === q._id ? 'solved' : ''}`} key={q._id}>
              <span className="q-title">{q.title}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{q.topic} · {q.subtopic}</span>
              <span className={`badge badge-${q.level}`}>{q.level}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => startEdit(q)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(q._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
