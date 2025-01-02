import React from 'react';
import { needsWindInput } from '../../utils/windModification';
import { formatPerformance } from '../../utils/formatters';
import { isCombinedEvent } from '../../utils/eventCodes';

function ResultsDisplay({ 
  mode, 
  points, 
  performance, 
  eventType, 
  windSpeed, 
  adjustedPoints 
}) {
  if (!points && !performance) return null;

  const formatResult = () => {
    if (!performance) return '';
    
    if (isCombinedEvent(eventType)) {
      return Math.round(performance);
    }
    
    if (typeof performance === 'string') {
      return performance;
    }
    
    return formatPerformance(Number(performance), eventType);
  };

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
            {formatResult()}
        </p>
      )}
    </div>
  );
}

export default ResultsDisplay;
