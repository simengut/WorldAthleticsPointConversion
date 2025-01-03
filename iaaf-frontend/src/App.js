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

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [gender, setGender] = useState('mens');
  const [season, setSeason] = useState('outdoor');
  const [mode, setMode] = useState('performance');
  const [eventType, setEventType] = useState('100m');
  const [performance, setPerformance] = useState('');
  const [points, setPoints] = useState(null);
  const [windSpeed, setWindSpeed] = useState('');
  const [showWind, setShowWind] = useState(false);
  const [adjustedPoints, setAdjustedPoints] = useState(null);

  const calculate = async () => {
    try {
      if (mode === 'points') {
        const formattedPerformance = formatTimeInput(performance, eventType);
        if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType) && !formattedPerformance) {
          console.error('Invalid time format');
          return;
        }
        const response = await fetch(`${backendUrl}/api/calculate-points`, {
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

        if (showWind && season === 'outdoor' && needsWindInput(eventType) && windSpeed) {
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
        const response = await fetch(`${backendUrl}/api/calculate-performance`, {
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

  const calculatorForm = (
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
  );

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'calculator' ? (
          <div className="calculator-page">
            <div className="calculator-sidebar">
              {calculatorForm}
            </div>
            <div className="calculator-main">
              <EventComparison 
                points={showWind ? adjustedPoints : points}
                gender={gender} 
                season={season} 
              />
            </div>
          </div>
        ) : activeTab === 'competition' ? (
          <div className="competition-page">
            <div className="competition-sidebar">
              {calculatorForm}
            </div>
            <div className="competition-main">
              <CompetitionTable 
                points={showWind ? adjustedPoints : points}
                eventType={eventType}
                gender={gender}
                season={season}
              />
            </div>
          </div>
        ) : (
          <About />
        )}
      </main>
    </div>
  );
}

export default App;