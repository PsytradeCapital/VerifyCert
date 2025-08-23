// Region utilities for internationalization
export interface RegionInfo {
  code: string;
  name: string;
  phonePrefix: string;
  preferredAuthMethod: 'email' | 'phone';
  timezone: string;
  currency: string;
}

const REGIONS: Record<string, RegionInfo> = {
  US: {
    code: 'US',
    name: 'United States',
    phonePrefix: '+1',
    preferredAuthMethod: 'email',
    timezone: 'America/New_York',
    currency: 'USD'
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    phonePrefix: '+44',
    preferredAuthMethod: 'email',
    timezone: 'Europe/London',
    currency: 'GBP'
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    phonePrefix: '+254',
    preferredAuthMethod: 'phone',
    timezone: 'Africa/Nairobi',
    currency: 'KES'
  }
};

export function getRegionInfo(regionCode: string): RegionInfo | null {
  return REGIONS[regionCode] || null;
}

export function getAllRegions(): RegionInfo[] {
  return Object.values(REGIONS);
}

export function getRegionOptions(): Array<{ value: string; label: string }> {
  return Object.values(REGIONS).map(region => ({
    value: region.code,
    label: region.name
  }));
}

export function detectRegionFromPhone(phoneNumber: string): string | null {
  for (const region of Object.values(REGIONS)) {
    if (phoneNumber.startsWith(region.phonePrefix)) {
      return region.code;
    }
  }
  return null;
}

export function formatPhoneNumber(phoneNumber: string, regionCode?: string): string {
  if (regionCode) {
    const region = getRegionInfo(regionCode);
    if (region && phoneNumber.startsWith(region.phonePrefix)) {
      const number = phoneNumber.substring(region.phonePrefix.length);
      return `${region.phonePrefix} ${number}`;
    }
  }
  return phoneNumber;
}

export function getPreferredAuthMethod(regionCode: string): 'email' | 'phone' {
  const region = getRegionInfo(regionCode);
  return region?.preferredAuthMethod || 'email';
}

export function getRegionTimezone(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  return region?.timezone || 'UTC';
}

export function getCurrencySymbol(regionCode: string): string {
  const region = getRegionInfo(regionCode);
  
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    KES: 'KSh',
    EUR: '€'
  };
  
  return currencySymbols[region?.currency || 'USD'] || '$';
}
