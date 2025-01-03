import React from 'react';
import { getPlaceholderText } from '../../utils/formatters';

function Form({
  mode,
  setMode,
  gender,
  setGender,
  season,
  setSeason,
  eventType,
  setEventType,
  performance,
  setPerformance,
  points,
  setPoints,
}) {
  return (
    <>
      <div className="gender-toggle">
        <div className="toggle-container">
          <div 
            className={`toggle-slider ${gender === 'womens' ? 'right' : 'left'}`}
          />
          <div 
            className={`toggle-option ${gender === 'mens' ? 'active' : ''}`}
            onClick={() => setGender('mens')}
          >
            Men
          </div>
          <div 
            className={`toggle-option ${gender === 'womens' ? 'active' : ''}`}
            onClick={() => setGender('womens')}
          >
            Women
          </div>
        </div>
      </div>

      <div className="season-toggle">
        <div className="toggle-container">
          <div 
            className={`toggle-slider ${season === 'indoor' ? 'right' : 'left'}`}
          />
          <div 
            className={`toggle-option ${season === 'outdoor' ? 'active' : ''}`}
            onClick={() => setSeason('outdoor')}
          >
            Outdoor
          </div>
          <div 
            className={`toggle-option ${season === 'indoor' ? 'active' : ''}`}
            onClick={() => setSeason('indoor')}
          >
            Indoor
          </div>
        </div>
      </div>

      <div className="mode-toggle">
        <div className="toggle-container">
          <div 
            className={`toggle-slider ${mode === 'performance' ? 'right' : 'left'}`}
          />
          <div 
            className={`toggle-option ${mode === 'points' ? 'active' : ''}`}
            onClick={() => setMode('points')}
          >
            Performance → Points
          </div>
          <div 
            className={`toggle-option ${mode === 'performance' ? 'active' : ''}`}
            onClick={() => setMode('performance')}
          >
            Points → Performance
          </div>
        </div>
      </div>

      <div>
        <label>Event:</label>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <optgroup label="Track Events">
            {season === 'indoor' ? (
              <>
                <option value="60m">60m</option>
                <option value="200m">200m</option>
                <option value="400m">400m</option>
                <option value="800m">800m</option>
                <option value="1500m">1500m</option>
                <option value="3000m">3000m</option>
                <option value="60mH">{gender === 'mens' ? '60m Hurdles' : '60m Hurdles'}</option>
              </>
            ) : (
              <>
                <option value="100m">100m</option>
                <option value="200m">200m</option>
                <option value="400m">400m</option>
                <option value="800m">800m</option>
                <option value="1500m">1500m</option>
                <option value="3000m">3000m</option>
                <option value="5000m">5000m</option>
                <option value="10000m">10000m</option>
                <option value={gender === 'mens' ? '110mH' : '100mH'}>
                  {gender === 'mens' ? '110m Hurdles' : '100m Hurdles'}
                </option>
                <option value="400mH">400m Hurdles</option>
              </>
            )}
          </optgroup>
          <optgroup label="Field Events">
            <option value="High Jump">High Jump</option>
            <option value="Pole Vault">Pole Vault</option>
            <option value="Long Jump">Long Jump</option>
            <option value="Triple Jump">Triple Jump</option>
            <option value="Shot Put">Shot Put</option>
            {season === 'outdoor' && (
              <>
                <option value="Discus Throw">Discus Throw</option>
                <option value="Hammer Throw">Hammer Throw</option>
                <option value="Javelin Throw">Javelin Throw</option>
              </>
            )}
          </optgroup>
          <optgroup label="Combined Events">
            {season === 'outdoor' ? (
              <option value={gender === 'mens' ? 'Decathlon' : 'Heptathlon'}>
                {gender === 'mens' ? 'Decathlon' : 'Heptathlon'}
              </option>
            ) : (
              <option value={gender === 'mens' ? 'Heptathlon' : 'Pentathlon'}>
                {gender === 'mens' ? 'Heptathlon' : 'Pentathlon'}
              </option>
            )}
          </optgroup>
        </select>
      </div>

      <div>
        <label>{mode === 'points' ? 'Result:' : 'Points:'}</label>
        <input
          type="text"
          value={mode === 'points' ? performance : points}
          onChange={(e) => mode === 'points' ? setPerformance(e.target.value) : setPoints(e.target.value)}
          placeholder={getPlaceholderText(eventType, mode)}
          pattern={mode === 'points' && ['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType) ? 
            "^[0-9]{1,2}:[0-5][0-9].[0-9]{2}$" : undefined}
        />
      </div>
    </>
  );
}

export default Form;
