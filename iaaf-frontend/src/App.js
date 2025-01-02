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
import Form from './components/CalculatorForm/Form';

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

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'calculator' ? (
          <div className="content-container">
            <div className="calculator-wrapper">
              <div className="calculator-form">
                <Form
                  mode={mode}
                  setMode={setMode}
                  gender={gender}
                  setGender={setGender}
                  season={season}
                  setSeason={setSeason}
                  eventType={eventType}
                  setEventType={setEventType}
                  performance={performance}
                  setPerformance={setPerformance}
                  points={points}
                  setPoints={setPoints}
                />

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