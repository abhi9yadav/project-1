const Spinner = ({ label = 'Loading...' }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    {label && <p className="spinner-label">{label}</p>}
  </div>
);

export default Spinner;
