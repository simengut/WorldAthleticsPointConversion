import { formatTimeInput } from './formatters';
import { EVENT_CODES } from './eventCodes';
import { calculateWindModification, needsWindInput } from './windModification';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const calculatePoints = async ({
  mode,
  performance,
  eventType,
  gender,
  season,
  windSpeed
}) => {
  try {
    if (mode === 'points') {
      // Performance to Points calculation
      const formattedPerformance = formatTimeInput(performance, eventType);
      if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType) && !formattedPerformance) {
        console.error('Invalid time format');
        return null;
      }

      const response = await fetch(`${backendUrl}/api/calculate-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: EVENT_CODES[eventType] || eventType,
          performance: formattedPerformance || performance,
          gender: gender,
          season: season
        }),
      });
      const data = await response.json();
      const basePoints = Math.round(data.points);

      // Only apply wind adjustment for outdoor events
      if (season === 'outdoor' && needsWindInput(eventType, season) && windSpeed) {
        const windAdjustment = calculateWindModification(
          eventType,
          parseFloat(windSpeed),
          basePoints
        );
        return {
          points: basePoints,
          adjustedPoints: Math.round(basePoints + windAdjustment)
        };
      }
      
      return {
        points: basePoints,
        adjustedPoints: basePoints
      };
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}; 