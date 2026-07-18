import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SheetView = () => {
  const { sheetName } = useParams();
  const { user } = useAuth();
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSimilar, setShowSimilar] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get(`/api/questions/sheet/${sheetName}`);
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [sheetName]);

  const isSolved = (questionId) => {
    return user?.solvedQuestions?.some(q => q.questionId === questionId);
  };

  const isStarred = (questionId) => {
    return user?.starredQuestions?.some(q => q.questionId === questionId);
  };

  const toggleSolved = async (questionId) => {
    if (!user) return alert('Please login to track progress');
    try {
      const { data } = await axios.post(`/api/questions/${questionId}/solve`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating solved status:', error);
    }
  };

  const toggleStar = async (questionId) => {
    if (!user) return alert('Please login');
    try {
      await axios.post(`/api/questions/${questionId}/star`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error updating star status:', error);
    }
  };

  const saveNote = async (questionId) => {
    if (!user) return alert('Please login');
    try {
      await axios.post(`/api/questions/${questionId}/note`, { note }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Note saved!');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{sheetName.replace('-', ' ').toUpperCase()} DSA SHEET</h1>
      
      {Object.entries(questions).map(([topic, subtopics]) => (
        <div key={topic} style={styles.topicCard}>
          <h2 style={styles.topicTitle}>{topic}</h2>
          {Object.entries(subtopics).map(([subtopic, qs]) => (
            <div key={subtopic} style={styles.subtopic}>
              <h3 style={styles.subtopicTitle}>{subtopic}</h3>
              {qs.map((q) => (
                <div key={q._id} style={{...styles.question, opacity: isSolved(q._id) ? 0.6 : 1}}>
                  <div style={styles.questionHeader}>
                    <input
                      type="checkbox"
                      checked={isSolved(q._id)}
                      onChange={() => toggleSolved(q._id)}
                      style={styles.checkbox}
                    />
                    <span style={styles.questionTitle}>{q.title}</span>
                    <span style={{...styles.badge, backgroundColor: q.level === 'easy' ? '#4CAF50' : q.level === 'medium' ? '#FF9800' : '#f44336'}}>
                      {q.level.toUpperCase()}
                    </span>
                    <button onClick={() => toggleStar(q._id)} style={styles.starBtn}>
                      {isStarred(q._id) ? '★' : '☆'}
                    </button>
                    <button onClick={() => {setSelectedQuestion(q); setNote('');}} style={styles.viewBtn}>View</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {selectedQuestion && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <button onClick={() => setSelectedQuestion(null)} style={styles.closeBtn}>×</button>
            <h2>{selectedQuestion.title}</h2>
            <p><strong>Topic:</strong> {selectedQuestion.topic} | <strong>Subtopic:</strong> {selectedQuestion.subtopic}</p>
            <a href={selectedQuestion.questionLink} target="_blank" rel="noopener noreferrer" style={styles.link}>Problem Link</a>
            {selectedQuestion.videoLink && <a href={selectedQuestion.videoLink} target="_blank" rel="noopener noreferrer" style={styles.link}>Video Solution</a>}
            
            {selectedQuestion.similarQuestions?.length > 0 && (
              <div style={styles.similarSection}>
                <button onClick={() => setShowSimilar(!showSimilar)} style={styles.similarBtn}>
                  {showSimilar ? 'Hide Similar Questions' : 'Show Similar Questions'}
                </button>
                {showSimilar && (
                  <ul style={styles.similarList}>
                    {selectedQuestion.similarQuestions.map(sq => (
                      <li key={sq._id}>{sq.title} - <span style={styles.badge}>{sq.level}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={styles.noteSection}>
              <h3>Your Notes</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your notes here..."
                style={styles.textarea}
              />
              <button onClick={() => saveNote(selectedQuestion._id)} style={styles.saveBtn}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '20px' },
  topicCard: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  topicTitle: { color: '#3498db', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' },
  subtopic: { marginBottom: '20px' },
  subtopicTitle: { color: '#7f8c8d', fontSize: '18px', marginBottom: '10px' },
  question: { background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '10px' },
  questionHeader: { display: 'flex', alignItems: 'center', gap: '15px' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  questionTitle: { flex: 1, fontWeight: '500' },
  badge: { padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px' },
  starBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  viewBtn: { background: '#3498db', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '30px', borderRadius: '10px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '30px', cursor: 'pointer' },
  link: { display: 'block', color: '#3498db', marginBottom: '10px' },
  similarSection: { marginTop: '20px' },
  similarBtn: { background: '#9b59b6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
  similarList: { marginTop: '10px', paddingLeft: '20px' },
  noteSection: { marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' },
  textarea: { width: '100%', minHeight: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' },
  saveBtn: { background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
};

export default SheetView;
