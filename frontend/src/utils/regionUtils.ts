export interface RegionInfo {
  code: string;
  name: string;
  currency: string;
  timezone: string;
}
const REGIONS: Record<string, RegionInfo> = {
  'US': {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    timezone: 'America/New_York'
  },
  'GB': {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    timezone: 'Europe/London'
  },
  'CA': {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    timezone: 'America/Toronto'
  }
};

export function getRegionInfo(regionCode: string): RegionInfo | null {
  return REGIONS[regionCode] || null;
}
export function getCurrentRegion(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'US';
  } catch {
    return 'US';
  }
}