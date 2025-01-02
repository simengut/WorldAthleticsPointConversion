import React from 'react';

function WindAdjustment({ 
  eventType, 
  windSpeed, 
  setWindSpeed, 
  showWind, 
  setShowWind 
}) {
  return (
    <div className="wind-adjustment">
      <div className="wind-toggle">
        <label>
          <input
            type="checkbox"
            checked={showWind}
            onChange={(e) => setShowWind(e.target.checked)}
          />
          Apply Wind Adjustment
        </label>
      </div>
      {showWind && (
        <div className="wind-input">
          <label>Wind Speed (m/s):</label>
          <input
            type="number"
            step="0.1"
            value={windSpeed}
            onChange={(e) => setWindSpeed(e.target.value)}
            placeholder="Enter wind speed"
          />
        </div>
      )}
    </div>
  );
}

export default WindAdjustment;
