// ============================================================================
// app/cloud-icons.ts - Yoto emoji icon mappings for cloud types
// ============================================================================

import type { CloudType } from './types';

// Map cloud types to Yoto public emoji icon IDs
// Format: yoto:#HASH_ID
export const CLOUD_ICON_MAP: Record<CloudType, string> = {
  clear: 'yoto:#mK3HNIpyYnhz2Yp5RPhLXLKOiRWHSAwxFrMQmh9XYus',
  cumulus: 'yoto:#gCgNJrpHZ186Hd1ttD-k0R2Cf38FbPW3riwe27WAiJA',
  stratus: 'yoto:#1vqi7TbtDFUTSxI_oGbV7pzdxmo8mQfNkF28oejlhuE',
  stratocumulus: 'yoto:#JLTJueAzxOwxWJkmcLQWfAUJttJC05BbSU2WfRIutCk',
  nimbostratus: 'yoto:#aNVbUvb4CzoaEMctPdvtaM2oivo6G5MP4DMuthHtbuo',
  cumulonimbus: 'yoto:#EiEvE_d2TnHauFJtQj_jqA2NEWNqRalWuAyZ-wMd3Ag',
  cirrus: 'yoto:#UrFx-26vO0Y3nOe7OlYVeUd97ikpQ8WC3MgjO3ynqo4',
  cirrocumulus: 'yoto:#V0APu-QUyc7AHuad6vusSV4gwtgffkyYqRshCx7VyrA',
  cirrostratus: 'yoto:#iylNTFWzISGseY7HLLveUbli051TyYuuNYHHei_aWp0',
  altocumulus: 'yoto:#XPr0F6yDowK5h5Y_zUZSL6GPaVNfY9SGuPl5OxD6oPQ',
  altostratus: 'yoto:#75CyQHuG2h-4-wN72mSKWFpZ7Q4dRlT9s1E-TxEPDaM',
};

export function getCloudIcon(cloudType: CloudType): string {
  return CLOUD_ICON_MAP[cloudType] || CLOUD_ICON_MAP.cumulus;
}
