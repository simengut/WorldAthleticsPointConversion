import { useState, useEffect } from 'react';
import { formatPerformance } from './utils/formatters';
import { COMPETITION_POINTS, MEET_LABELS } from './utils/competitionPoints';

// New Row component to handle the API calls
function TableRow({ place, targetTotal, eventType, gender, season, baseMeet, basePlace }) {
  const [performances, setPerformances] = useState({});

  const calculateRequiredPerformance = async (requiredPoints) => {
    try {
      const response = await fetch('http://localhost:5001/api/calculate-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          points: requiredPoints,
          gender: gender,
          season: season
        }),
      });
      const data = await response.json();
      return data.performance;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPerformances = async () => {
      if (targetTotal) {
        for (const meet of Object.keys(MEET_LABELS)) {
          if (COMPETITION_POINTS[meet][place]) {
            const placePoints = COMPETITION_POINTS[meet][place];
            const requiredBase = targetTotal - placePoints;
            
            const performance = await calculateRequiredPerformance(requiredBase);
            if (performance) {
              setPerformances(prev => ({
                ...prev,
                [meet]: formatPerformance(performance, eventType)
              }));
            }
          }
        }
      } else {
        // Clear performances when targetTotal is null
        setPerformances({});
      }
    };

    fetchPerformances();
  }, [targetTotal, place, eventType, gender, season, baseMeet, basePlace]);

  return (
    <tr>
      <td>{place}</td>
      {Object.keys(MEET_LABELS).map(meet => (
        <td key={meet}>
          {COMPETITION_POINTS[meet][place] ? performances[meet] || '-' : '-'}
        </td>
      ))}
    </tr>
  );
}

// Main CompetitionTable component
function CompetitionTable({ points, eventType, gender, season }) {
  const [baseMeet, setBaseMeet] = useState('');
  const [basePlace, setBasePlace] = useState('');

  return (
    <div className="competition-table">
      {/* Base Points and Meet Level Settings */}
      <h2>Competition Level Comparison</h2>
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
            </select>
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
                const targetTotal = points && baseMeet && basePlace ? 
                  Number(points) + COMPETITION_POINTS[baseMeet][basePlace] : null;
                
                return (
                  <TableRow
                    key={place}
                    place={place}
                    targetTotal={targetTotal}
                    eventType={eventType}
                    gender={gender}
                    season={season}
                    baseMeet={baseMeet}
                    basePlace={basePlace}
                  />
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