import './App.css';
import { useState } from 'react';
import Navbar from './components/Navbar';
import CompetitionTable from './CompetitionTable';
import About from './components/About';
import Form from './components/CalculatorForm/Form';
import WindAdjustment from './components/CalculatorForm/WindAdjustment';
import ResultsDisplay from './components/CalculatorForm/ResultsDisplay';
import EventComparison from './components/EventComparison';
import { needsWindInput, calculateWindModification } from './utils/windModification';
import { EVENT_CODES } from './utils/eventCodes';
import { formatTimeInput } from './utils/formatters';

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
            event_type: EVENT_CODES[eventType] || eventType,
            performance: formattedPerformance || performance,
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        const basePoints = Math.round(data.points);
        setPoints(basePoints);

        if (season === 'outdoor' && needsWindInput(eventType, season) && windSpeed) {
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
            points: Number(points),
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        
        // Format the performance based on event type
        if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
          const minutes = Math.floor(data.performance / 60);
          const seconds = (data.performance % 60).toFixed(2);
          setPerformance(`${minutes}:${seconds.padStart(5, '0')}`);
        } else {
          setPerformance(data.performance.toFixed(2));
        }
        
        setPoints(Number(points));
        setAdjustedPoints(Number(points));
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
          <div className="calculator-page">
            <div className="calculator-sidebar">
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
                  />
                )}
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
            <div className="calculator-main">
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