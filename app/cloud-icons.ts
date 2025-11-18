// ============================================================================
// app/cloud-icons.ts - Yoto emoji icon mappings for cloud types
// ============================================================================

import type { CloudType } from './types';

// Map cloud types to Yoto public emoji icon IDs
// Using available icons from Yoto's public API
// Format: yoto:#HASH_ID
export const CLOUD_ICON_MAP: Record<CloudType, string> = {
  clear: 'yoto:#5fbc4235c456ea000809ade5', // Sun
  cumulus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  stratus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  stratocumulus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  nimbostratus: 'yoto:#61a781341a0b8b0009fd383a', // Umbrella (rain)
  cumulonimbus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud (has lightning/storm tags)
  cirrus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  cirrocumulus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  cirrostratus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  altocumulus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
  altostratus: 'yoto:#61a77e5e1a0b8b0009fd380e', // Cloud
};

export function getCloudIcon(cloudType: CloudType): string {
  return CLOUD_ICON_MAP[cloudType] || CLOUD_ICON_MAP.cumulus;
}
