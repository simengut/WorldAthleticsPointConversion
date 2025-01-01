import { useState, useEffect } from 'react';

function EventComparison({ points, gender, season }) {
  const [equivalentPerformances, setEquivalentPerformances] = useState({});

  // Helper function to format performances
  const formatPerformance = (performance, event) => {
    if (['800m', '1500m', '3000m', '5000m', '10000m', '3000mSC'].includes(event)) {
      const timeInSeconds = parseFloat(performance);
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = (timeInSeconds % 60).toFixed(2);
      return `${minutes}:${seconds.padStart(5, '0')}`;
    }
    else if (['50m', '60m', '100m', '200m', '400m', '60mH', '100mH', '110mH', '400mH'].includes(event)) {
      return parseFloat(performance).toFixed(2);
    }
    else {
      return parseFloat(performance).toFixed(2);
    }
  };

  // Helper function to get events by gender and season
  const getEventsByGenderAndSeason = (events) => {
    const MENS_ONLY = ['110mH'];
    const WOMENS_ONLY = ['100mH'];
    const OUTDOOR_ONLY = ['100m', '200m', '100mH', '110mH', 'DT', 'HT', 'JT'];
    const INDOOR_ONLY = ['50m', '60m'];

    return events.filter(event => {
      // Filter by gender
      if (gender === 'mens' && WOMENS_ONLY.includes(event)) return false;
      if (gender === 'womens' && MENS_ONLY.includes(event)) return false;

      // Filter by season
      if (season === 'indoor' && OUTDOOR_ONLY.includes(event)) return false;
      if (season === 'outdoor' && INDOOR_ONLY.includes(event)) return false;

      return true;
    });
  };

  useEffect(() => {
    if (points) {
      calculateEquivalentPerformances();
    }
  }, [points, gender, season]);

  const calculateEquivalentPerformances = async () => {
    const events = [
      // Track Events
      '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m',
      // Hurdles
      '100mH', '110mH', '400mH', '3000mSC',
      // Jumps
      'HJ', 'PV', 'LJ', 'TJ',
      // Throws
      'SP', 'DT', 'HT', 'JT'
    ];

    const performances = {};
    
    const filteredEvents = getEventsByGenderAndSeason(events);
    
    for (const event of filteredEvents) {
      try {
        const response = await fetch('http://localhost:5001/api/calculate-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: event,
            points: points,
            gender: gender,
            season: season
          }),
        });
        const data = await response.json();
        performances[event] = data.performance;
      } catch (error) {
        console.error(`Error calculating performance for ${event}:`, error);
        performances[event] = 'N/A';
      }
    }
    
    setEquivalentPerformances(performances);
  };

  const renderEventSection = (title, events) => {
    const filteredEvents = getEventsByGenderAndSeason(events);
    if (filteredEvents.length === 0) return null;

    return (
      <div className="event-section">
        <h3>{title}</h3>
        <table>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event}>
                <td>{event}</td>
                <td>{equivalentPerformances[event] 
                  ? formatPerformance(equivalentPerformances[event], event) 
                  : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!points) {
    return (
      <div className="event-comparison">
        <p>Enter points to see equivalent performances</p>
      </div>
    );
  }

  return (
    <div className="event-comparison">
      <h2>Equivalent Performances</h2>
      {renderEventSection('Sprints & Hurdles', 
        season === 'indoor' 
          ? ['50m', '60m', '200m', '400m', '60mH', '400mH']
          : ['100m', '200m', '400m', '100mH', '110mH', '400mH']
      )}
      {renderEventSection('Middle Distance', ['800m', '1500m', '3000m'])}
      {season === 'outdoor' && renderEventSection('Long Distance', ['5000m', '10000m'])}
      {renderEventSection('Jumps', ['HJ', 'PV', 'LJ', 'TJ'])}
      {renderEventSection('Throws', 
        season === 'indoor' 
          ? ['SP']
          : ['SP', 'DT', 'HT', 'JT']
      )}
    </div>
  );
}

export default EventComparison; 