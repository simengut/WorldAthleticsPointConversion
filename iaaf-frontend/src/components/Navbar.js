function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo">
          World Athletics Points Conversion
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            Points Calculator
          </button>
          <button 
            className={`nav-link ${activeTab === 'competition' ? 'active' : ''}`}
            onClick={() => setActiveTab('competition')}
          >
            World Ranking Points
          </button>
          <button 
            className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 