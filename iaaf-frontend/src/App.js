import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CompetitionTable from './CompetitionTable';
import About from './components/About';
import EventComparison from './components/EventComparison';
import { calculateWindModification, WIND_AFFECTED_EVENTS } from './utils/windModification';

const EVENT_CODES = {
  'High Jump': 'HJ',
  'Pole Vault': 'PV',
  'Long Jump': 'LJ',
  'Triple Jump': 'TJ',
  'Shot Put': 'SP',
  'Discus Throw': 'DT',
  'Hammer Throw': 'HT',
  'Javelin Throw': 'JT',
  'Decathlon': 'Decathlon',
  'Heptathlon': 'Heptathlon',
  'Pentathlon': 'Pentathlon'
};

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

  const formatTimeInput = (input, event) => {
    if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(event)) {
      // Convert mm:ss.xx format to seconds for API
      const parts = input.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const seconds = parseFloat(parts[1]);
        if (!isNaN(minutes) && !isNaN(seconds)) {
          return (minutes * 60 + seconds).toFixed(2);
        }
      }
      return null;
    }
    return input;
  };

  const calculate = async () => {
    try {
      if (mode === 'points') {
        // Format the performance input if it's a middle/long distance event
        const formattedPerformance = formatTimeInput(performance, eventType);
        if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType) && !formattedPerformance) {
          console.error('Invalid time format');
          return;
        }

        const response = await fetch('http://localhost:5001/api/calculate-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: eventType,
            performance: formattedPerformance || performance,
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
            event_type: EVENT_CODES[eventType] || eventType,
            points: points,
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        
        // Format the performance based on event type
        if (isCombinedEvent(eventType)) {
          setPerformance(Math.round(data.performance).toString());
        } else if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
          const minutes = Math.floor(data.performance / 60);
          const seconds = (data.performance % 60).toFixed(2);
          setPerformance(`${minutes}:${seconds.padStart(5, '0')}`);
        } else {
          setPerformance(data.performance.toFixed(2));
        }
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

  const isCombinedEvent = (event) => {
    return ['Decathlon', 'Heptathlon', 'Pentathlon'].includes(event);
  };

  const renderResults = () => {
    if (!points && !performance) return null;
    
    return (
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
          <p className="points">
            {eventType}: {
              isCombinedEvent(eventType) 
                ? Math.round(performance)
                : ['High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus Throw', 'Hammer Throw', 'Javelin Throw'].includes(eventType)
                  ? `${parseFloat(performance).toFixed(2)}m`
                  : ['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)
                    ? performance  // Already formatted in mm:ss.xx
                    : `${parseFloat(performance).toFixed(2)}s`
            }
          </p>
        )}
      </div>
    );
  };

  const getPlaceholderText = (eventType) => {
    if (['100m', '200m', '400m', '60m', '100mH', '110mH', '400mH', '60mH'].includes(eventType)) {
      return `Enter ${eventType} time (ss.xx)`;
    } else if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
      return `Enter ${eventType} time (mm:ss.xx)`;
    } else if (['Long Jump', 'Triple Jump'].includes(eventType)) {
      return `Enter ${eventType} distance (m.cm)`;
    } else if (['High Jump', 'Pole Vault'].includes(eventType)) {
      return `Enter ${eventType} height (m.cm)`;
    } else if (['Shot Put', 'Discus Throw', 'Hammer Throw', 'Javelin Throw'].includes(eventType)) {
      return `Enter ${eventType} distance (m.cm)`;
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
                    <optgroup label="Track Events">
                      {season === 'indoor' ? (
                        <>
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
                    <optgroup label="Hurdles">
                      {season === 'indoor' ? (
                        <option value="60mH">60mH</option>
                      ) : (
                        <>
                          {gender === 'mens' ? (
                            <option value="110mH">110mH</option>
                          ) : (
                            <option value="100mH">100mH</option>
                          )}
                          <option value="400mH">400mH</option>
                        </>
                      )}
                    </optgroup>
                    <optgroup label="Jumps">
                      <option value="High Jump">High Jump</option>
                      <option value="Pole Vault">Pole Vault</option>
                      <option value="Long Jump">Long Jump</option>
                      <option value="Triple Jump">Triple Jump</option>
                    </optgroup>
                    <optgroup label="Throws">
                      <option value="Shot Put">Shot Put</option>
                      {season === 'outdoor' && (
                        <>
                          <option value="Discus Throw">Discus Throw</option>
                          <option value="Hammer Throw">Hammer Throw</option>
                          <option value="Javelin Throw">Javelin Throw</option>
                        </>
                      )}
                    </optgroup>
                    <optgroup label="Combined Events">
                      {season === 'indoor' ? (
                        <>
                          {gender === 'mens' ? (
                            <option value="Heptathlon">Heptathlon</option>
                          ) : (
                            <option value="Pentathlon">Pentathlon</option>
                          )}
                        </>
                      ) : (
                        <>
                          {gender === 'mens' ? (
                            <option value="Decathlon">Decathlon</option>
                          ) : (
                            <option value="Heptathlon">Heptathlon</option>
                          )}
                        </>
                      )}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label>{mode === 'points' ? 'Result:' : 'Points:'}</label>
                  <input
                    type="text"
                    value={mode === 'points' ? performance : points}
                    onChange={(e) => {
                      if (mode === 'points') {
                        setPerformance(e.target.value);
                      } else {
                        // Only allow numbers for points input
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setPoints(value);
                        setPerformance('');
                      }
                    }}
                    placeholder={mode === 'points' ? getPlaceholderText(eventType) : 'Enter points (0-1400)'}
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