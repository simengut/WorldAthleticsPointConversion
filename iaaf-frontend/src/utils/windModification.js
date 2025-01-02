export const WIND_AFFECTED_EVENTS = [
  '100m',
  '200m',
  '100mH',
  '110mH',
  'Long Jump',
  'Triple Jump'
];

// Points modification per wind speed (m/s)
export const WIND_MODIFICATIONS = {
  '-5.0': 30,
  '-4.0': 24,
  '-3.0': 18,
  '-2.0': 12,
  '-1.0': 6,
  '0.0': 0,
  '2.0': 0,    // No modification between 0 and +2.0
  '2.1': -0.6, // Deductions start from here
  '3.0': -6,
  '4.0': -12,
  '5.0': -18
};

export const needsWindInput = (eventType, season) => {
  // No wind adjustments for any indoor events
  if (season === 'indoor') {
    return false;
  }
  
  // Only allow wind adjustments for specified outdoor events
  return WIND_AFFECTED_EVENTS.includes(eventType);
};

export const calculateWindModification = (eventType, windSpeed, points) => {
  if (!needsWindInput(eventType)) return 0;
  
  // Convert to number if string
  windSpeed = Number(windSpeed);

  // No modification between 0 and +2.0
  if (windSpeed > 0 && windSpeed <= 2.0) return 0;

  // Calculate modification
  if (windSpeed <= 0) {
    // Headwind
    return Math.abs(windSpeed) * 6;
  } else {
    // Tailwind (above 2.0)
    return (windSpeed - 2.0) * -6;
  }
}; 