import { useState, useEffect } from 'react';

const EVENT_CODES = {
  '60m': '60m',
  '100m': '100m',
  '200m': '200m',
  '400m': '400m',
  '800m': '800m',
  '1500m': '1500m',
  '3000m': '3000m',
  '5000m': '5000m',
  '10000m': '10000m',
  '60mH': '60mH',
  '100mH': '100mH',
  '110mH': '110mH',
  '400mH': '400mH',
  'High Jump': 'HJ',
  'Pole Vault': 'PV',
  'Long Jump': 'LJ',
  'Triple Jump': 'TJ',
  'Shot Put': 'SP',
  'Discus Throw': 'DT',
  'Hammer Throw': 'HT',
  'Javelin Throw': 'JT',
  'Decathlon': 'Decathlon',
  'Heptathlon': 'Heptathlon',
  'Pentathlon': 'Pentathlon'
};

function EventComparison({ points, gender, season }) {
  const [equivalentPerformances, setEquivalentPerformances] = useState({});

  // Helper function to check if an event is a combined event
  const isCombinedEvent = (event) => {
    return ['Decathlon', 'Heptathlon', 'Pentathlon'].includes(event);
  };

  // Helper function to format performances
  const formatPerformance = (performance, event) => {
    // For combined events, return the whole number without decimals
    if (isCombinedEvent(event)) {
      return Math.round(performance).toString();
    }

    // For track events (ending with 'm' or 'mH')
    if (event.endsWith('m') || event.endsWith('mH')) {
      if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(event)) {
        // Format mm:ss.xx for middle/long distance
        const minutes = Math.floor(performance / 60);
        const seconds = (performance % 60).toFixed(2);
        return `${minutes}:${seconds.padStart(5, '0')}`;
      }
      // Format ss.xx for sprints
      return performance.toFixed(2);
    }

    // For field events
    return performance.toFixed(2);
  };

  // Helper function to get events by gender and season
  const getEventsByGenderAndSeason = (events) => {
    return events.filter(event => {
      if (gender === 'mens' && ['100mH', 'Pentathlon'].includes(event)) return false;
      if (gender === 'womens' && ['110mH', 'Decathlon', 'Heptathlon'].includes(event) && season === 'indoor') return false;
      if (season === 'indoor' && ['100m', '100mH', '110mH', '400mH', '5000m', '10000m', 'Discus Throw', 'Hammer Throw', 'Javelin Throw', 'Decathlon'].includes(event)) return false;
      return true;
    });
  };

  useEffect(() => {
    if (points) {
      const allEvents = [
        ...(season === 'indoor' ? ['60m', '200m', '400m', '60mH'] : ['100m', '200m', '400m', '100mH', '110mH', '400mH']),
        '800m', '1500m', '3000m',
        ...(season === 'outdoor' ? ['5000m', '10000m'] : []),
        'High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump',
        'Shot Put',
        ...(season === 'outdoor' ? ['Discus Throw', 'Hammer Throw', 'Javelin Throw'] : []),
        ...(season === 'outdoor' ? 
          [(gender === 'mens' ? 'Decathlon' : 'Heptathlon')] : 
          [(gender === 'mens' ? 'Heptathlon' : 'Pentathlon')]
        )
      ];
      
      const filteredEvents = getEventsByGenderAndSeason(allEvents);
      calculateEquivalentPerformances(filteredEvents);
    }
  }, [points, gender, season]);

  const calculateEquivalentPerformances = async (events) => {
    try {
      const responses = await Promise.all(events.map(event => {
        // Special handling for combined events
        const eventType = EVENT_CODES[event] || event;
        
        // Log the request for debugging
        console.log('Calculating performance for:', {
          event_type: eventType,
          points: points,
          gender: gender,
          season: season
        });

        return fetch('http://localhost:5001/api/calculate-performance', {
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
      }));

      const data = await Promise.all(responses.map(async (r) => {
        const result = await r.json();
        // Log the response for debugging
        console.log('API Response:', result);
        return result;
      }));

      const performances = {};
      events.forEach((event, i) => {
        performances[event] = data[i].performance;
      });
      setEquivalentPerformances(performances);
    } catch (error) {
      console.error('Error calculating equivalent performances:', error);
    }
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
                  ? formatPerformance(equivalentPerformances[event], EVENT_CODES[event] || event) 
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
          ? ['60m', '200m', '400m', '60mH']
          : ['100m', '200m', '400m', '100mH', '110mH', '400mH']
      )}
      {renderEventSection('Middle Distance', ['800m', '1500m', '3000m'])}
      {season === 'outdoor' && renderEventSection('Long Distance', ['5000m', '10000m'])}
      {renderEventSection('Jumps', [
        'High Jump', 'Pole Vault', 'Long Jump', 'Triple Jump'
      ])}
      {renderEventSection('Throws', 
        season === 'indoor' 
          ? ['Shot Put']
          : ['Shot Put', 'Discus Throw', 'Hammer Throw', 'Javelin Throw']
      )}
      {renderEventSection('Combined Events',
        season === 'outdoor'
          ? (gender === 'mens' ? ['Decathlon'] : ['Heptathlon'])
          : (gender === 'mens' ? ['Heptathlon'] : ['Pentathlon'])
      )}
    </div>
  );
}

export default EventComparison; 