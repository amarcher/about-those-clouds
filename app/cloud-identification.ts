// ============================================================================
// lib/cloud-identification.ts - Cloud type logic
// ============================================================================

import type { WeatherData, CloudInfo, CloudType } from './types';

// Milo-compatible cloud types (fluffy cumulus-family clouds)
export const MILO_CLOUD_TYPES: CloudType[] = [
  'cumulus',
  'stratocumulus',
  'altocumulus',
  'cirrocumulus',
];

export function isMiloPresent(cloudInfo: CloudInfo): boolean {
  return MILO_CLOUD_TYPES.includes(cloudInfo.type);
}

export function identifyCloudType(data: WeatherData): CloudInfo {
  const cloudCoverage = data.clouds.all;
  const weatherCondition = data.weather[0];
  const temp = data.main.temp;

  if (cloudCoverage < 10) return getCloudInfo('clear');
  if (weatherCondition.main === 'Thunderstorm')
    return getCloudInfo('cumulonimbus');

  if (weatherCondition.main === 'Rain' || weatherCondition.main === 'Drizzle') {
    if (
      weatherCondition.id >= 502 ||
      weatherCondition.description.includes('heavy')
    ) {
      return getCloudInfo('nimbostratus');
    } else if (cloudCoverage > 75) {
      return getCloudInfo('stratus');
    } else {
      return getCloudInfo('stratocumulus');
    }
  }

  if (weatherCondition.main === 'Snow') return getCloudInfo('nimbostratus');
  if (weatherCondition.id >= 701 && weatherCondition.id < 800)
    return getCloudInfo('stratus');

  if (cloudCoverage >= 10 && cloudCoverage < 50) {
    return temp > 15 ? getCloudInfo('cumulus') : getCloudInfo('cirrus');
  }

  if (cloudCoverage >= 50 && cloudCoverage < 85) {
    if (temp > 15) return getCloudInfo('stratocumulus');
    if (temp > 0) return getCloudInfo('altocumulus');
    return getCloudInfo('cirrocumulus');
  }

  if (cloudCoverage >= 85) {
    if (temp > 10) return getCloudInfo('stratus');
    if (temp > -5) return getCloudInfo('altostratus');
    return getCloudInfo('cirrostratus');
  }

  return getCloudInfo('cumulus');
}

function getCloudInfo(type: CloudType): CloudInfo {
  const cloudDatabase: Record<CloudType, CloudInfo> = {
    clear: {
      type: 'clear',
      scientificName: 'Clear Sky',
      kidFriendlyName: 'Blue Sky',
      altitude: 'N/A',
      description: 'No clouds in sight!',
      funFact:
        'Even on a clear day, there are millions of tiny water droplets floating in the air!',
    },
    cumulus: {
      type: 'cumulus',
      scientificName: 'Cumulus',
      kidFriendlyName: 'Cotton Ball Clouds',
      altitude: 'Low (2,000-6,000 feet)',
      description: 'Puffy white clouds that look like cotton balls.',
      funFact: 'These clouds form when warm air rises on a sunny day!',
    },
    cumulonimbus: {
      type: 'cumulonimbus',
      scientificName: 'Cumulonimbus',
      kidFriendlyName: 'Thunder Giants',
      altitude: 'All levels (up to 60,000 feet!)',
      description: 'Massive towering clouds that create thunderstorms.',
      funFact: 'Some are taller than Mount Everest!',
    },
    stratus: {
      type: 'stratus',
      scientificName: 'Stratus',
      kidFriendlyName: 'Gray Blanket',
      altitude: 'Low (surface-6,500 feet)',
      description: 'A flat, gray blanket covering the sky.',
      funFact: 'When these touch the ground, we call it fog!',
    },
    stratocumulus: {
      type: 'stratocumulus',
      scientificName: 'Stratocumulus',
      kidFriendlyName: 'Lumpy Blanket',
      altitude: 'Low (2,000-6,500 feet)',
      description: 'Patches of gray or white bumpy clouds.',
      funFact: 'These are the most common clouds on Earth!',
    },
    nimbostratus: {
      type: 'nimbostratus',
      scientificName: 'Nimbostratus',
      kidFriendlyName: 'Rain Blanket',
      altitude: 'Low to Mid (surface-10,000 feet)',
      description: 'Thick, dark clouds that bring steady rain.',
      funFact: 'These clouds are like giant sponges squeezing out rain!',
    },
    cirrus: {
      type: 'cirrus',
      scientificName: 'Cirrus',
      kidFriendlyName: 'Wispy Feathers',
      altitude: 'High (20,000-40,000 feet)',
      description: 'Thin, wispy clouds like feathers in the sky.',
      funFact: 'These clouds are made of ice crystals, not water drops!',
    },
    cirrostratus: {
      type: 'cirrostratus',
      scientificName: 'Cirrostratus',
      kidFriendlyName: 'Halo Clouds',
      altitude: 'High (20,000-40,000 feet)',
      description: 'A thin veil that creates halos around the sun.',
      funFact: 'These clouds act like a giant ice crystal prism!',
    },
    cirrocumulus: {
      type: 'cirrocumulus',
      scientificName: 'Cirrocumulus',
      kidFriendlyName: 'Fish Scale Sky',
      altitude: 'High (20,000-40,000 feet)',
      description: 'Small white patches like fish scales.',
      funFact: 'Sailors call this a "mackerel sky"!',
    },
    altocumulus: {
      type: 'altocumulus',
      scientificName: 'Altocumulus',
      kidFriendlyName: 'Puffy Sheep',
      altitude: 'Mid (6,500-20,000 feet)',
      description: 'Gray or white puffs like sheep in the sky.',
      funFact: 'Morning sheep clouds might mean afternoon thunderstorms!',
    },
    altostratus: {
      type: 'altostratus',
      scientificName: 'Altostratus',
      kidFriendlyName: 'Gray Veil',
      altitude: 'Mid (6,500-20,000 feet)',
      description: 'A gray sheet that makes the sun look frosted.',
      funFact: 'These clouds are preparing to bring rain!',
    },
  };

  return cloudDatabase[type];
}
