// Format time input for middle/long distance events
export const formatTimeInput = (input, eventType) => {
  if (!['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
    return input;
  }

  // Check if input matches mm:ss.xx format
  const timeRegex = /^(\d{1,2}):([0-5]\d\.\d{2})$/;
  const match = input.match(timeRegex);

  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2]);
    return (minutes * 60 + seconds).toFixed(2);
  }

  return null;
};

// Format performance output based on event type
export const formatPerformance = (performance, eventType) => {
  // For middle/long distance events
  if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
    const minutes = Math.floor(performance / 60);
    const seconds = (performance % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  }

  // For track events
  if (eventType.endsWith('m') || eventType.endsWith('mH')) {
    return performance.toFixed(2);
  }

  // For field events
  return performance.toFixed(2);
};

// Get placeholder text for input field
export const getPlaceholderText = (eventType, mode) => {
  if (mode === 'points') {
    // For running events
    if (['100m', '200m', '400m', '60m', '100mH', '110mH', '400mH', '60mH'].includes(eventType)) {
      return `Enter ${eventType} time (ss.xx)`;
    } else if (['800m', '1500m', '3000m', '5000m', '10000m'].includes(eventType)) {
      return `Enter ${eventType} time (mm:ss.xx)`;
    } 
    // For field events
    else if (['Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault'].includes(eventType)) {
      return `Enter ${eventType} distance (m.cm)`;
    } else if (['Shot Put', 'Discus Throw', 'Hammer Throw', 'Javelin Throw'].includes(eventType)) {
      return `Enter ${eventType} distance (m.cm)`;
    } 
    // For combined events
    else if (['Decathlon', 'Heptathlon', 'Pentathlon'].includes(eventType)) {
      return `Enter ${eventType} score (whole number)`;
    }
    return 'Enter performance';
  } else {
    return 'Enter points (0-1400)';
  }
};
