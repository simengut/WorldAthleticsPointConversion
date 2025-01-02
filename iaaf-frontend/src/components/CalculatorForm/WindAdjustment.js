import React from 'react';
import { calculateWindModification } from '../../utils/windModification';

function WindAdjustment({ 
  eventType, 
  windSpeed, 
  setWindSpeed, 
  showWind, 
  setShowWind, 
  needsWindInput 
}) {
  if (!needsWindInput(eventType)) return null;

  return (
    <div className="wind-section">
      <div className="wind-controls">
        <div className="wind-toggle">
          <input
            type="checkbox"
            checked={showWind}
            onChange={(e) => setShowWind(e.target.checked)}
          />
          <label>Add wind information</label>
        </div>
        {showWind && (
          <input
            type="number"
            value={windSpeed}
            onChange={(e) => setWindSpeed(e.target.value)}
            step="0.1"
            placeholder="Enter wind speed (m/s)"
          />
        )}
      </div>
      <div className="wind-info">
        <p>Note: Positive values indicate tailwind, negative values indicate headwind.</p>
      </div>
    </div>
  );
}

export default WindAdjustment;
