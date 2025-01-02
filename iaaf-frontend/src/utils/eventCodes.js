export const EVENT_CODES = {
  // Field Events
  'High Jump': 'HJ',
  'Pole Vault': 'PV',
  'Long Jump': 'LJ',
  'Triple Jump': 'TJ',
  'Shot Put': 'SP',
  'Discus Throw': 'DT',
  'Hammer Throw': 'HT',
  'Javelin Throw': 'JT',
  
  // Combined Events
  'Decathlon': 'Decathlon',
  'Heptathlon': 'Heptathlon',
  'Pentathlon': 'Pentathlon'
};

// Helper function to check if an event is a combined event
export const isCombinedEvent = (event) => {
  return ['Decathlon', 'Heptathlon', 'Pentathlon'].includes(event);
};
