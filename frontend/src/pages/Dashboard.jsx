import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/questions/progress/stats', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading || !user) return <div style={styles.loading}>Loading...</div>;

  const totalQuestions = 150; // Example total - adjust based on your sheet
  const progressPercent = Math.round((stats.total / totalQuestions) * 100);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user.name}!</h1>
      
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, backgroundColor: '#3498db'}}>
          <h3>Total Solved</h3>
          <p style={styles.statNumber}>{stats.total}</p>
        </div>
        <div style={{...styles.statCard, backgroundColor: '#4CAF50'}}>
          <h3>Easy</h3>
          <p style={styles.statNumber}>{stats.easy}</p>
        </div>
        <div style={{...styles.statCard, backgroundColor: '#FF9800'}}>
          <h3>Medium</h3>
          <p style={styles.statNumber}>{stats.medium}</p>
        </div>
        <div style={{...styles.statCard, backgroundColor: '#f44336'}}>
          <h3>Hard</h3>
          <p style={styles.statNumber}>{stats.hard}</p>
        </div>
      </div>

      <div style={styles.progressSection}>
        <h2>Overall Progress</h2>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progressPercent}%`, backgroundColor: '#3498db'}}></div>
        </div>
        <p>{progressPercent}% Complete ({stats.total}/{totalQuestions})</p>
      </div>

      <div style={styles.levelProgress}>
        <h3>Level-wise Progress</h3>
        <div style={styles.levelBar}>
          <span>Easy:</span>
          <div style={styles.barContainer}>
            <div style={{...styles.barFill, width: `${Math.min(100, (stats.easy / 50) * 100)}%`, backgroundColor: '#4CAF50'}}></div>
          </div>
        </div>
        <div style={styles.levelBar}>
          <span>Medium:</span>
          <div style={styles.barContainer}>
            <div style={{...styles.barFill, width: `${Math.min(100, (stats.medium / 70) * 100)}%`, backgroundColor: '#FF9800'}}></div>
          </div>
        </div>
        <div style={styles.levelBar}>
          <span>Hard:</span>
          <div style={styles.barContainer}>
            <div style={{...styles.barFill, width: `${Math.min(100, (stats.hard / 30) * 100)}%`, backgroundColor: '#f44336'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', color: '#2c3e50', marginBottom: '30px' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' },
  statNumber: { fontSize: '36px', fontWeight: 'bold', margin: '10px 0 0' },
  progressSection: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  progressBar: { width: '100%', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '15px', overflow: 'hidden', margin: '10px 0' },
  progressFill: { height: '100%', transition: 'width 0.3s ease' },
  levelProgress: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  levelBar: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  barContainer: { flex: 1, height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', transition: 'width 0.3s ease' },
};

export default Dashboard;
