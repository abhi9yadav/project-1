import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    sheet: '1-month',
    topic: '',
    subtopic: '',
    level: 'easy',
    questionLink: '',
    videoLink: '',
    resources: [],
    similarQuestions: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/questions', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage('Question added successfully!');
      setFormData({
        title: '',
        sheet: '1-month',
        topic: '',
        subtopic: '',
        level: 'easy',
        questionLink: '',
        videoLink: '',
        resources: [],
        similarQuestions: []
      });
    } catch (error) {
      setMessage('Error adding question: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Panel - Add Question</h1>
      
      {message && <div style={styles.message}>{message}</div>}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Question Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sheet</label>
            <select name="sheet" value={formData.sheet} onChange={handleChange} style={styles.input}>
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Level</label>
            <select name="level" value={formData.level} onChange={handleChange} style={styles.input}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Subtopic</label>
            <input
              type="text"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Question Link</label>
          <input
            type="url"
            name="questionLink"
            value={formData.questionLink}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Video Link (Optional)</label>
          <input
            type="url"
            name="videoLink"
            value={formData.videoLink}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Adding...' : 'Add Question'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  message: { padding: '15px', borderRadius: '5px', marginBottom: '20px', backgroundColor: '#d4edda', color: '#155724' },
  form: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  label: { fontWeight: 'bold', color: '#555' },
  input: { padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' },
  btn: { width: '100%', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '14px', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' },
};

export default AdminPanel;
