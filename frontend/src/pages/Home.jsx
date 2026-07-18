import { Link } from 'react-router-dom';

const Home = () => {
  const sheets = [
    { name: '1-month', title: '1 Month DSA Sheet', description: 'Complete DSA preparation in 1 month', color: '#3498db' },
    { name: '3-months', title: '3 Months DSA Sheet', description: 'Comprehensive 3-month preparation plan', color: '#9b59b6' },
    { name: '6-months', title: '6 Months DSA Sheet', description: 'Detailed 6-month mastery program', color: '#e67e22' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Track Your DSA Journey</h1>
        <p style={styles.subtitle}>Master Data Structures & Algorithms with our structured learning paths</p>
      </div>
      
      <div style={styles.sheetsGrid}>
        {sheets.map((sheet) => (
          <Link to={`/sheet/${sheet.name}`} key={sheet.name} style={{...styles.sheetCard, borderColor: sheet.color}}>
            <h2 style={{...styles.sheetTitle, color: sheet.color}}>{sheet.title}</h2>
            <p style={styles.sheetDescription}>{sheet.description}</p>
            <button style={{...styles.sheetBtn, backgroundColor: sheet.color}}>Start Now</button>
          </Link>
        ))}
      </div>

      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Features</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>✓</div>
            <h3>Track Progress</h3>
            <p>Monitor your solved questions by difficulty level</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>★</div>
            <h3>Star Questions</h3>
            <p>Mark important questions for revision</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📝</div>
            <h3>Add Notes</h3>
            <p>Take personal notes on each question</p>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🎥</div>
            <h3>Video Solutions</h3>
            <p>Access curated video tutorials</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    fontSize: '48px',
    color: '#2c3e50',
    marginBottom: '15px',
  },
  subtitle: {
    fontSize: '20px',
    color: '#7f8c8d',
  },
  sheetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sheetCard: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    textDecoration: 'none',
    border: '3px solid transparent',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  sheetTitle: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  sheetDescription: {
    color: '#7f8c8d',
    marginBottom: '20px',
  },
  sheetBtn: {
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  features: {
    maxWidth: '1200px',
    margin: '80px auto 0',
    padding: '40px 20px',
  },
  featuresTitle: {
    textAlign: 'center',
    fontSize: '36px',
    color: '#2c3e50',
    marginBottom: '40px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  feature: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },
};

export default Home;
