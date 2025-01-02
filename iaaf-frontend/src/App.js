import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CompetitionTable from './CompetitionTable';
import About from './components/About';
import EventComparison from './components/EventComparison';
import { calculateWindModification, WIND_AFFECTED_EVENTS } from './utils/windModification';
import { EVENT_CODES, isCombinedEvent } from './utils/eventCodes';
import { formatTimeInput, formatPerformance, getPlaceholderText } from './utils/formatters';
import WindAdjustment from './components/CalculatorForm/WindAdjustment';
import ResultsDisplay from './components/CalculatorForm/ResultsDisplay';

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
  const [showWind, setShowWind] = useState(false);

  const needsWindInput = (event) => WIND_AFFECTED_EVENTS.includes(event);

  const calculate = async () => {
    try {
      if (mode === 'points') {
        // Performance to Points calculation
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
            event_type: EVENT_CODES[eventType] || eventType, // Use code for field events
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
                    onChange={(e) => mode === 'points' ? setPerformance(e.target.value) : setPoints(e.target.value)}
                    placeholder={getPlaceholderText(eventType, mode)}
                    pattern={mode === 'points' && ['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType) ? 
                      "^[0-9]{1,2}:[0-5][0-9].[0-9]{2}$" : undefined}
                  />
                </div>

                <WindAdjustment
                  eventType={eventType}
                  windSpeed={windSpeed}
                  setWindSpeed={setWindSpeed}
                  showWind={showWind}
                  setShowWind={setShowWind}
                  needsWindInput={needsWindInput}
                />

                <button className="calculate-button" onClick={calculate}>
                  Calculate
                </button>

                <ResultsDisplay
                  mode={mode}
                  points={points}
                  performance={performance}
                  eventType={eventType}
                  windSpeed={windSpeed}
                  adjustedPoints={adjustedPoints}
                />

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