import { useState, useEffect } from 'react';
import { formatPerformance } from './utils/formatters';
import { COMPETITION_POINTS, MEET_LABELS } from './utils/competitionPoints';
import { EVENT_CODES } from './utils/eventCodes';

// New Row component to handle the API calls
function TableRow({ place, targetTotal, eventType, gender, season, baseMeet, basePlace }) {
  const [performances, setPerformances] = useState({});

  useEffect(() => {
    const fetchPerformances = async () => {
      if (targetTotal) {
        try {
          const response = await fetch('http://localhost:5001/api/calculate-performances-batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base_points: targetTotal,
              event_type: eventType,
              gender: gender,
              season: season
            }),
          });
          
          const data = await response.json();
          if (data.performances) {
            setPerformances(data.performances);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        setPerformances({});
      }
    };

    fetchPerformances();
  }, [targetTotal, eventType, gender, season]);

  return (
    <tr>
      <td>{place}</td>
      {Object.keys(MEET_LABELS).map(meet => (
        <td key={meet}>
          {COMPETITION_POINTS[meet][place] ? 
            formatPerformance(performances[meet]?.[place], eventType) || '-' 
            : '-'}
        </td>
      ))}
    </tr>
  );
}

// Helper function to get the last scoring place for a meet
const getLastScoringPlace = (meet) => {
  return Math.max(...Object.keys(COMPETITION_POINTS[meet]).map(Number)) + 1;
};

// Main CompetitionTable component
function CompetitionTable({ points, eventType, gender, season }) {
  const [baseMeet, setBaseMeet] = useState('');
  const [basePlace, setBasePlace] = useState('');
  const [performances, setPerformances] = useState({});

  // Calculate equivalent performances when points or base selections change
  useEffect(() => {
    const calculateEquivalentPerformances = async () => {
      if (!points) return;

      const basePoints = baseMeet && basePlace ? 
        (basePlace === 'other' ? points : points + COMPETITION_POINTS[baseMeet][basePlace]) : 
        points;

      const newPerformances = {};
      
      for (const meet of Object.keys(MEET_LABELS)) {
        newPerformances[meet] = {};
        
        for (const place of Object.keys(COMPETITION_POINTS[meet])) {
          const targetPoints = basePoints - COMPETITION_POINTS[meet][place];
          
          if (targetPoints > 0) {
            try {
              const response = await fetch('http://localhost:5001/api/calculate-performance', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  event_type: EVENT_CODES[eventType] || eventType,
                  points: targetPoints,
                  gender: gender,
                  season: season
                }),
              });
              
              const data = await response.json();
              newPerformances[meet][place] = data.performance;
            } catch (error) {
              console.error('Error calculating performance:', error);
              newPerformances[meet][place] = '-';
            }
          } else {
            newPerformances[meet][place] = '-';
          }
        }
      }
      
      setPerformances(newPerformances);
    };

    calculateEquivalentPerformances();
  }, [points, baseMeet, basePlace, eventType, gender, season]);

  if (!points) return null;

  return (
    <div className="competition-table">
      <h2>Competition Level Comparison</h2>

      {/* Base Meet Selection */}
      <div className="settings-grid">
        <div className="setting-group">
          <label>Base Points</label>
          <div className="points-display">
            {points || 'Enter points'}
          </div>
        </div>
        <div className="setting-group">
          <label>Meet Level</label>
          <select value={baseMeet} onChange={(e) => setBaseMeet(e.target.value)}>
            <option value="">No bonus</option>
            {Object.keys(MEET_LABELS).map(meet => (
              <option key={meet} value={meet}>{MEET_LABELS[meet]}</option>
            ))}
          </select>
        </div>
        {baseMeet && (
          <div className="setting-group">
            <label>Place</label>
            <select value={basePlace} onChange={(e) => setBasePlace(e.target.value)}>
              <option value="">Select place</option>
              {Object.keys(COMPETITION_POINTS[baseMeet]).map(place => (
                <option key={place} value={place}>{place}</option>
              ))}
              <option value="other">{getLastScoringPlace(baseMeet)}+</option>
            </select>
          </div>
        )}
        {baseMeet && basePlace && (
          <div className="setting-group">
            <label>Total Points</label>
            <div className="points-breakdown">
              {points} + {basePlace === 'other' ? '0' : COMPETITION_POINTS[baseMeet][basePlace]} = {
                basePlace === 'other' ? 
                points : 
                points + COMPETITION_POINTS[baseMeet][basePlace]
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Required Performances Table */}
      <div className="table-section">
        <h3>Required Performances for Equivalent Points</h3>
        <div className="equivalency-table">
          <table>
            <thead>
              <tr>
                <th>Place</th>
                {Object.keys(MEET_LABELS).map(meet => (
                  <th key={meet}>{MEET_LABELS[meet]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(16)].map((_, index) => {
                const place = index + 1;
                return (
                  <tr key={place}>
                    <td>{place}</td>
                    {Object.keys(MEET_LABELS).map(meet => (
                      <td key={meet}>
                        {performances[meet]?.[place] ? 
                          formatPerformance(performances[meet][place], eventType) : 
                          '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Points Table */}
      <div className="table-section">
        <h3>Total Points (Performance + Placement)</h3>
        <div className="equivalency-table">
          <table>
            <thead>
              <tr>
                <th>Place</th>
                {Object.keys(MEET_LABELS).map(meet => (
                  <th key={meet}>{MEET_LABELS[meet]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(16)].map((_, index) => {
                const place = index + 1;
                return (
                  <tr key={place}>
                    <td>{place}</td>
                    {Object.keys(MEET_LABELS).map(meet => (
                      <td key={meet}>
                        {points && COMPETITION_POINTS[meet][place] ? 
                          (points + COMPETITION_POINTS[meet][place]) : 
                          '-'}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CompetitionTable; 