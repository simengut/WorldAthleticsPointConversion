import { useState, useEffect } from 'react';
import Form from './components/CalculatorForm/Form';
import WindAdjustment from './components/CalculatorForm/WindAdjustment';
import ResultsDisplay from './components/CalculatorForm/ResultsDisplay';
import { needsWindInput, calculateWindModification } from './utils/windModification';


const COMPETITION_POINTS = {
  OW: { // Olympic/World Championships
    1: 375, 2: 330, 3: 300, 4: 270, 5: 250, 6: 230, 7: 215, 8: 200,
    9: 130, 10: 120, 11: 110, 12: 100, 13: 95, 14: 90, 15: 85, 16: 80
  },
  DF: { // Diamond Final
    1: 240, 2: 210, 3: 185, 4: 170, 5: 155, 6: 145, 7: 135, 8: 125,
    9: 90, 10: 80, 11: 70, 12: 60
  },
  GW: { // Diamond League
    1: 200, 2: 170, 3: 150, 4: 140, 5: 130, 6: 120, 7: 110, 8: 100,
    9: 70, 10: 60, 11: 50, 12: 45
  },
  GL: { // Continental Gold
    1: 170, 2: 145, 3: 130, 4: 120, 5: 110, 6: 100, 7: 90, 8: 80,
    9: 60, 10: 50, 11: 45, 12: 40
  },
  A: { // Category A
    1: 140, 2: 120, 3: 110, 4: 100, 5: 90, 6: 80, 7: 70, 8: 60
  },
  B: { // Category B
    1: 100, 2: 80, 3: 70, 4: 60, 5: 55, 6: 50, 7: 45, 8: 40
  },
  C: { // Category C
    1: 60, 2: 50, 3: 45, 4: 40, 5: 35, 6: 30, 7: 27, 8: 25
  },
  D: { // Category D
    1: 40, 2: 35, 3: 30, 4: 25, 5: 22, 6: 19, 7: 17, 8: 15
  },
  E: { // Category E
    1: 25, 2: 21, 3: 18, 4: 15, 5: 12, 6: 10
  },
  F: { // Category F
    1: 15, 2: 10, 3: 5
  }
};

const MEET_LABELS = {
  OW: "Olympics/Worlds",
  DF: "Diamond Final",
  GW: "Diamond League",
  GL: "Diamond League Final",
  A: "Category A",
  B: "Category B",
  C: "Category C",
  D: "Category D",
  E: "Category E",
  F: "Category F"
};

function CompetitionTable({ 
  points, 
  eventType, 
  onCalculatePerformance,
  mode,
  setMode,
  gender,
  setGender,
  season,
  setSeason,
  setEventType,
  performance,
  setPerformance,
  setPoints,
  windSpeed,
  setWindSpeed,
  showWind,
  setShowWind,
  adjustedPoints,
  calculate
}) {
  const [basePoints, setBasePoints] = useState('');
  const [baseMeet, setBaseMeet] = useState('');
  const [basePlace, setBasePlace] = useState('');
  const [equivalentPerformances, setEquivalentPerformances] = useState(null);

  // Calculate actual performance points (removing competition bonus)
  const getActualPoints = () => {
    if (!baseMeet || !basePlace) return basePoints;
    const competitionPoints = COMPETITION_POINTS[baseMeet][parseInt(basePlace)] || 0;
    return basePoints - competitionPoints;
  };

  // Calculate equivalent points for a given meet and place
  const getEquivalentPoints = (meet, place) => {
    const actualPoints = getActualPoints();
    const competitionPoints = COMPETITION_POINTS[meet][place] || 0;
    return actualPoints + competitionPoints;
  };

  // Calculate required performance for equivalent points
  const calculateEquivalentPerformances = async () => {
    const totalPoints = basePoints;
    const results = {};

    for (const meet of Object.keys(MEET_LABELS)) {
      results[meet] = {};
      for (const place of Object.keys(COMPETITION_POINTS[meet])) {
        const competitionPoints = COMPETITION_POINTS[meet][place];
        const requiredPerformancePoints = totalPoints - competitionPoints;
        
        if (requiredPerformancePoints > 0) {
          const performance = await onCalculatePerformance(requiredPerformancePoints, eventType);
          results[meet][place] = performance;
        } else {
          results[meet][place] = null;
        }
      }
    }

    setEquivalentPerformances(results);
  };

  useEffect(() => {
    if (basePoints && eventType) {
      calculateEquivalentPerformances();
    }
  }, [basePoints, eventType, baseMeet, basePlace]);

  return (
    <div className="competition-page">
      <div className="competition-main">
        <div className="competition-table">
          <div className="baseline-settings">
            <h2>Competition Level Comparison</h2>
            <div className="settings-grid">
              <div className="setting-group">
                <label>Base Points</label>
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(Number(e.target.value))}
                  placeholder="Enter points"
                />
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
          </div>

          <div className="tables-container">
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
                              {COMPETITION_POINTS[meet][place] 
                                ? getEquivalentPoints(meet, place)
                                : '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                              {equivalentPerformances?.[meet]?.[place] ?? '-'}
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
        </div>
      </div>
    </div>
  );
}

export default CompetitionTable; 