import React, { useState, useEffect, useCallback } from 'react';
import { EVENT_CODES } from '../utils/eventCodes';

function EventComparison({ points, gender, season }) {
  const [performances, setPerformances] = useState({});

  const getEventsByGenderAndSeason = useCallback((events) => {
    return events.filter(event => {
      if (gender === 'mens' && ['100mH', 'Pentathlon'].includes(event)) return false;
      if (gender === 'womens' && ['110mH'].includes(event)) return false;
      if (gender === 'womens' && ['110mH', 'Decathlon', 'Heptathlon'].includes(event) && season === 'indoor') return false;
      if (season === 'indoor' && ['100m', '100mH', '110mH', '400mH', '5000m', '10000m', 'Discus Throw', 'Hammer Throw', 'Javelin Throw', 'Decathlon'].includes(event)) return false;
      return true;
    });
  }, [gender, season]);

  const calculateEquivalentPerformances = useCallback(async (events) => {
    try {
      const responses = await Promise.all(events.map(event => {
        const eventType = EVENT_CODES[event] || event;
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
        return result;
      }));

      const performances = {};
      events.forEach((event, i) => {
        performances[event] = data[i].performance;
      });
      setPerformances(performances);
    } catch (error) {
      console.error('Error calculating equivalent performances:', error);
    }
  }, [points, gender, season]);

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
  }, [points, gender, season, calculateEquivalentPerformances, getEventsByGenderAndSeason]);

  // Helper function to format performances
  const formatPerformance = (performance, event) => {
    // For combined events, return the whole number without decimals
    if (['Decathlon', 'Heptathlon', 'Pentathlon'].includes(event)) {
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
                <td>{performances[event] 
                  ? formatPerformance(performances[event], EVENT_CODES[event] || event) 
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