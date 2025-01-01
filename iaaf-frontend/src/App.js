import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CompetitionTable from './CompetitionTable';
import About from './components/About';
import EventComparison from './components/EventComparison';
import { calculateWindModification, WIND_AFFECTED_EVENTS } from './utils/windModification';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [gender, setGender] = useState('mens');
  const [season, setSeason] = useState('outdoor');
  const [mode, setMode] = useState('performance');
  const [eventType, setEventType] = useState('100m');
  const [performance, setPerformance] = useState('');
  const [points, setPoints] = useState(null);
  const [windSpeed, setWindSpeed] = useState('');
  const [adjustedPoints, setAdjustedPoints] = useState(null);

  const needsWindInput = (event) => WIND_AFFECTED_EVENTS.includes(event);

  const calculate = async () => {
    try {
      if (mode === 'points') {
        const response = await fetch('http://localhost:5001/api/calculate-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: eventType,
            performance: performance,
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        const basePoints = Math.round(data.points);
        setPoints(basePoints);

        // Apply wind adjustment if needed
        if (needsWindInput(eventType) && windSpeed) {
          const windAdjustment = calculateWindModification(
            eventType,
            parseFloat(windSpeed),
            basePoints
          );
          setAdjustedPoints(Math.round(basePoints + windAdjustment));
        } else {
          setAdjustedPoints(basePoints);
        }
      } else {
        // Points to Performance calculation
        const response = await fetch('http://localhost:5001/api/calculate-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: eventType,
            points: points,
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        setPerformance(data.performance);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculatePerformance = async (eventType, points, gender, season) => {
    try {
      const response = await fetch('http://localhost:5001/api/calculate-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          points: points,
          gender: gender,
          season: season
        }),
      });
      const data = await response.json();
      return data.performance;
    } catch (error) {
      console.error('Error calculating performance:', error);
      return 'N/A';
    }
  };

  const renderResults = () => {
    if (!points && !performance) return null;
    
    return (
      <div className="results">
        <h2>Results</h2>
        <p className="points">
          {mode === 'points' 
            ? `${Math.round(points)} points`
            : performance}
        </p>
      </div>
    );
  };

  const getPlaceholderText = (eventType) => {
    // Sprint events (time format with decimals)
    if (['100m', '200m', '400m', '100mH', '110mH', '400mH'].includes(eventType)) {
      return `Enter ${eventType} result (ss.xx)`;
    }
    // Distance events (time format with minutes)
    else if (['800m', '1500m', '3000m', '5000m', '10000m', '3000mSC'].includes(eventType)) {
      return `Enter ${eventType} result (mm:ss.xx)`;
    }
    // Horizontal jumps (distance format)
    else if (['LJ', 'TJ'].includes(eventType)) {
      return `Enter ${eventType === 'LJ' ? 'Long Jump' : 'Triple Jump'} result (m.cm)`;
    }
    // Vertical jumps (height format)
    else if (['HJ', 'PV'].includes(eventType)) {
      return `Enter ${eventType === 'HJ' ? 'High Jump' : 'Pole Vault'} result (m.cm)`;
    }
    // Throws (distance format)
    else if (['SP', 'DT', 'HT', 'JT'].includes(eventType)) {
      const eventNames = {
        'SP': 'Shot Put',
        'DT': 'Discus',
        'HT': 'Hammer',
        'JT': 'Javelin'
      };
      return `Enter ${eventNames[eventType]} result (m.cm)`;
    }
    return 'Enter performance';
  };

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'calculator' ? (
          <div className="content-container">
            <div className="calculator-wrapper">
              <div className="calculator-form">
                <div className="gender-toggle">
                  <div className="toggle-container">
                    <div 
                      className={`toggle-slider ${gender === 'womens' ? 'right' : 'left'}`}
                    />
                    <div 
                      className={`toggle-option ${gender === 'mens' ? 'active' : ''}`}
                      onClick={() => setGender('mens')}
                    >
                      Men
                    </div>
                    <div 
                      className={`toggle-option ${gender === 'womens' ? 'active' : ''}`}
                      onClick={() => setGender('womens')}
                    >
                      Women
                    </div>
                  </div>
                </div>

                <div className="season-toggle">
                  <div className="toggle-container">
                    <div 
                      className={`toggle-slider ${season === 'indoor' ? 'right' : 'left'}`}
                    />
                    <div 
                      className={`toggle-option ${season === 'outdoor' ? 'active' : ''}`}
                      onClick={() => setSeason('outdoor')}
                    >
                      Outdoor
                    </div>
                    <div 
                      className={`toggle-option ${season === 'indoor' ? 'active' : ''}`}
                      onClick={() => setSeason('indoor')}
                    >
                      Indoor
                    </div>
                  </div>
                </div>

                <div className="toggle-group">
                  <label>Mode:</label>
                  <div className="toggle-container">
                    <div 
                      className={`toggle-option ${mode === 'points' ? 'selected' : ''}`}
                      onClick={() => {
                        setMode('points');
                        setPoints(null);
                        setPerformance('');
                        setAdjustedPoints(null);
                        setWindSpeed('');
                      }}
                    >
                      Result → Points
                    </div>
                    <div 
                      className={`toggle-option ${mode === 'performance' ? 'selected' : ''}`}
                      onClick={() => {
                        setMode('performance');
                        setPoints(null);
                        setPerformance('');
                        setAdjustedPoints(null);
                        setWindSpeed('');
                      }}
                    >
                      Points → Result
                    </div>
                  </div>
                </div>

                <div>
                  <label>Event:</label>
                  <select 
                    value={eventType}
                    onChange={(e) => {
                      setEventType(e.target.value);
                      if (!needsWindInput(e.target.value)) {
                        setWindSpeed('');
                        setAdjustedPoints(null);
                      }
                    }}
                  >
                    {/* Track Events */}
                    <optgroup label="Track Events">
                      {season === 'indoor' ? (
                        <>
                          <option value="50m">50m</option>
                          <option value="60m">60m</option>
                          <option value="200m">200m</option>
                          <option value="400m">400m</option>
                          <option value="800m">800m</option>
                          <option value="1500m">1500m</option>
                          <option value="3000m">3000m</option>
                        </>
                      ) : (
                        <>
                          <option value="100m">100m</option>
                          <option value="200m">200m</option>
                          <option value="400m">400m</option>
                          <option value="800m">800m</option>
                          <option value="1500m">1500m</option>
                          <option value="3000m">3000m</option>
                          <option value="5000m">5000m</option>
                          <option value="10000m">10000m</option>
                        </>
                      )}
                    </optgroup>

                    {/* Hurdles */}
                    <optgroup label="Hurdles">
                      {season === 'indoor' ? (
                        <option value="60mH">60m Hurdles</option>
                      ) : (
                        <>
                          {gender === 'mens' ? (
                            <option value="110mH">110m Hurdles</option>
                          ) : (
                            <option value="100mH">100m Hurdles</option>
                          )}
                          <option value="400mH">400m Hurdles</option>
                          <option value="3000mSC">3000m Steeplechase</option>
                        </>
                      )}
                    </optgroup>

                    {/* Jumps */}
                    <optgroup label="Jumps">
                      <option value="HJ">High Jump</option>
                      <option value="PV">Pole Vault</option>
                      <option value="LJ">Long Jump</option>
                      <option value="TJ">Triple Jump</option>
                    </optgroup>

                    {/* Throws */}
                    <optgroup label="Throws">
                      {season === 'indoor' ? (
                        <option value="SP">Shot Put</option>
                      ) : (
                        <>
                          <option value="SP">Shot Put</option>
                          <option value="DT">Discus</option>
                          <option value="HT">Hammer</option>
                          <option value="JT">Javelin</option>
                        </>
                      )}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label>{mode === 'points' ? 'Result:' : 'Points:'}</label>
                  <input
                    type="text"
                    value={mode === 'points' ? performance : points || ''}
                    onChange={(e) => {
                      if (mode === 'points') {
                        setPerformance(e.target.value);
                      } else {
                        setPoints(e.target.value);
                      }
                    }}
                    placeholder={mode === 'points' ? getPlaceholderText(eventType) : 'Enter points'}
                  />
                </div>

                {/* Wind input for relevant events */}
                {needsWindInput(eventType) && mode === 'points' && (
                  <div className="wind-input">
                    <label>Wind (m/s):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={windSpeed}
                      onChange={(e) => setWindSpeed(e.target.value)}
                      placeholder="Enter wind speed (+/-)"
                    />
                    <div className="wind-info">
                      + for tailwind, - for headwind
                    </div>
                  </div>
                )}

                <button className="calculate-button" onClick={calculate}>
                  Calculate
                </button>

                {(points || performance) && (
                  <div className="results">
                    <h2>Results</h2>
                    {mode === 'points' ? (
                      <>
                        <p className="points">Base Points: {points}</p>
                        {needsWindInput(eventType) && windSpeed && adjustedPoints !== points && (
                          <p className="points">
                            Wind Adjusted Points: {adjustedPoints}
                            <span className="wind-adjustment-info">
                              ({windSpeed > 0 ? '-' : '+'}{Math.abs(adjustedPoints - points)} points)
                            </span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="points">{performance}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="comparison-wrapper">
              <EventComparison 
                points={adjustedPoints || points}
                gender={gender}
                season={season}
              />
            </div>
          </div>
        ) : activeTab === 'competition' ? (
          <CompetitionTable 
            points={adjustedPoints || points}
            eventType={eventType}
            onCalculatePerformance={calculatePerformance}
          />
        ) : (
          <About />
        )}
      </main>
    </div>
  );
}

export default App;