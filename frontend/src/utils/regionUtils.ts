/**
 * Region detection and phone number utilities
 */

// import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

// Temporary type definitions until libphonenumber-js is installed
interface ParsedPhoneNumber {
  isValid(): boolean;
  formatNational(): string;
  format(format: string): string;
}

type CountryCode = string;

// Mock parsePhoneNumber function
function parsePhoneNumber(phoneNumber: string, region: string): ParsedPhoneNumber {
  return {
    isValid: () => /^\+?[\d\s\-\(\)]+$/.test(phoneNumber),
    formatNational: () => phoneNumber,
    format: (format: string) => phoneNumber
  };
}

// Region preferences for authentication methods
export const REGION_PREFERENCES = {
  // Email-preferred regions
  EMAIL_PREFERRED: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK'],
  
  // Mobile-preferred regions
  MOBILE_PREFERRED: ['IN', 'CN', 'BR', 'MX', 'ID', 'PH', 'TH', 'VN', 'MY', 'SG', 'KE', 'NG', 'ZA', 'EG']
};

// SMS gateway configuration by region
export const SMS_GATEWAYS = {
  // Africa's Talking regions
  AFRICAS_TALKING: ['KE', 'UG', 'TZ', 'RW', 'ZM', 'MW', 'NG', 'GH'],
  
  // Twilio (default for most regions)
  TWILIO: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IN', 'BR', 'MX', 'SG', 'MY']
};

/**
 * Detect user's region based on various methods
 */
export class RegionDetector {
  private static instance: RegionDetector;
  private detectedRegion: string | null = null;

  static getInstance(): RegionDetector {
    if (!RegionDetector.instance) {
      RegionDetector.instance = new RegionDetector();
    }
    return RegionDetector.instance;
  }

  /**
   * Get user's region using multiple detection methods
   */
  async detectRegion(): Promise<string> {
    if (this.detectedRegion) {
      return this.detectedRegion;
    }

    // Try different detection methods in order of preference
    let region = await this.detectFromTimezone();
    
    if (!region) {
      region = await this.detectFromLanguage();
    }
    
    if (!region) {
      region = await this.detectFromIP();
    }
    
    // Default to US if no detection method works
    region = region || 'US';
    
    this.detectedRegion = region;
    return region;
  }

  /**
   * Detect region from user's timezone
   */
  private async detectFromTimezone(): Promise<string | null> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const timezoneToRegion: Record<string, string> = {
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'America/Toronto': 'CA',
        'America/Vancouver': 'CA',
        'Europe/London': 'GB',
        'Europe/Berlin': 'DE',
        'Europe/Paris': 'FR',
        'Europe/Amsterdam': 'NL',
        'Europe/Stockholm': 'SE',
        'Asia/Kolkata': 'IN',
        'Asia/Shanghai': 'CN',
        'Asia/Tokyo': 'JP',
        'Asia/Singapore': 'SG',
        'Asia/Kuala_Lumpur': 'MY',
        'Australia/Sydney': 'AU',
        'Australia/Melbourne': 'AU',
        'Africa/Nairobi': 'KE',
        'Africa/Lagos': 'NG',
        'Africa/Johannesburg': 'ZA',
        'America/Sao_Paulo': 'BR',
        'America/Mexico_City': 'MX'
      };

      return timezoneToRegion[timezone] || null;
    } catch (error) {
      console.warn('Timezone detection failed:', error);
      return null;
    }
  }

  /**
   * Detect region from browser language
   */
  private async detectFromLanguage(): Promise<string | null> {
    try {
      const language = navigator.language || navigator.languages?.[0];
      if (!language) return null;

      const languageToRegion: Record<string, string> = {
        'en-US': 'US',
        'en-CA': 'CA',
        'en-GB': 'GB',
        'en-AU': 'AU',
        'de-DE': 'DE',
        'fr-FR': 'FR',
        'nl-NL': 'NL',
        'sv-SE': 'SE',
        'hi-IN': 'IN',
        'zh-CN': 'CN',
        'ja-JP': 'JP',
        'pt-BR': 'BR',
        'es-MX': 'MX',
        'ms-MY': 'MY',
        'th-TH': 'TH',
        'vi-VN': 'VN',
        'id-ID': 'ID',
        'sw-KE': 'KE',
        'yo-NG': 'NG',
        'af-ZA': 'ZA'
      };

      return languageToRegion[language] || null;
    } catch (error) {
      console.warn('Language detection failed:', error);
      return null;
    }
  }

  /**
   * Detect region from IP address (requires external service)
   */
  private async detectFromIP(): Promise<string | null> {
    try {
      // In production, you might want to use a more reliable service
      const response = await fetch('https://ipapi.co/country_code/', {
        timeout: 3000
      } as any);
      
      if (response.ok) {
        const countryCode = await response.text();
        return countryCode.trim().toUpperCase();
      }
    } catch (error) {
      console.warn('IP-based region detection failed:', error);
    }
    
    return null;
  }

  /**
   * Get preferred authentication method for a region
   */
  getAuthPreference(region: string): 'email' | 'phone' {
    if (REGION_PREFERENCES.EMAIL_PREFERRED.includes(region)) {
      return 'email';
    }
    if (REGION_PREFERENCES.MOBILE_PREFERRED.includes(region)) {
      return 'phone';
    }
    // Default to email for unknown regions
    return 'email';
  }

  /**
   * Get appropriate SMS gateway for a region
   */
  getSMSGateway(region: string): 'twilio' | 'africas_talking' {
    if (SMS_GATEWAYS.AFRICAS_TALKING.includes(region)) {
      return 'africas_talking';
    }
    return 'twilio';
  }
}

/**
 * Validate and format phone number for a specific region
 */
export function validatePhoneForRegion(phoneNumber: string, region: string): {
  isValid: boolean;
  formatted?: string;
  e164?: string;
  error?: string;
} {
  try {
    const parsed = parsePhoneNumber(phoneNumber, region as CountryCode);
    
    if (!parsed.isValid()) {
      return {
        isValid: false,
        error: 'Invalid phone number format for this region'
      };
    }

    return {
      isValid: true,
      formatted: parsed.formatNational(),
      e164: parsed.format('E.164')
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to parse phone number'
    };
  }
}

/**
 * Get region-specific UI defaults
 */
export function getRegionDefaults(region: string) {
  const authPreference = RegionDetector.getInstance().getAuthPreference(region);
  
  return {
    authMethod: authPreference,
    phoneCountryCode: region,
    dateFormat: getDateFormat(region),
    currency: getCurrency(region),
    language: getLanguage(region)
  };
}

function getDateFormat(region: string): string {
  const formats: Record<string, string> = {
    'US': 'MM/DD/YYYY',
    'CA': 'DD/MM/YYYY',
    'GB': 'DD/MM/YYYY',
    'AU': 'DD/MM/YYYY',
    'DE': 'DD.MM.YYYY',
    'FR': 'DD/MM/YYYY',
    'IN': 'DD/MM/YYYY',
    'CN': 'YYYY/MM/DD',
    'JP': 'YYYY/MM/DD'
  };
  
  return formats[region] || 'DD/MM/YYYY';
}

function getCurrency(region: string): string {
  const currencies: Record<string, string> = {
    'US': 'USD',
    'CA': 'CAD',
    'GB': 'GBP',
    'AU': 'AUD',
    'DE': 'EUR',
    'FR': 'EUR',
    'NL': 'EUR',
    'IN': 'INR',
    'CN': 'CNY',
    'JP': 'JPY',
    'BR': 'BRL',
    'MX': 'MXN',
    'SG': 'SGD',
    'MY': 'MYR',
    'KE': 'KES',
    'NG': 'NGN',
    'ZA': 'ZAR'
  };
  
  return currencies[region] || 'USD';
}

function getLanguage(region: string): string {
  const languages: Record<string, string> = {
    'US': 'en',
    'CA': 'en',
    'GB': 'en',
    'AU': 'en',
    'DE': 'de',
    'FR': 'fr',
    'NL': 'nl',
    'SE': 'sv',
    'IN': 'en',
    'CN': 'zh',
    'JP': 'ja',
    'BR': 'pt',
    'MX': 'es',
    'SG': 'en',
    'MY': 'en',
    'KE': 'en',
    'NG': 'en',
    'ZA': 'en'
  };
  
  return languages[region] || 'en';
}

// Export singleton instance
export const regionDetector = RegionDetector.getInstance();