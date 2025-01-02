import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CompetitionTable from './CompetitionTable';
import About from './components/About';
import EventComparison from './components/EventComparison';
import { WIND_AFFECTED_EVENTS } from './utils/windModification';
import WindAdjustment from './components/CalculatorForm/WindAdjustment';
import Form from './components/CalculatorForm/Form';
import { calculatePoints } from './utils/calculators';

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
    const result = await calculatePoints({
      mode,
      performance,
      eventType,
      gender,
      season,
      windSpeed
    });

    if (result) {
      setPoints(result.points);
      setAdjustedPoints(result.adjustedPoints);
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

                {mode === 'points' && season === 'outdoor' && needsWindInput(eventType, season) && (
                  <WindAdjustment
                    eventType={eventType}
                    windSpeed={windSpeed}
                    setWindSpeed={setWindSpeed}
                    showWind={showWind}
                    setShowWind={setShowWind}
                    needsWindInput={needsWindInput}
                  />
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
                        {needsWindInput(eventType, season) && windSpeed && adjustedPoints !== points && (
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